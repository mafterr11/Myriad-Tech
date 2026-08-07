-- Keep both project sequences contiguous and mutate them atomically.
-- Public project order and homepage order remain independent.

lock table public.projects in access exclusive mode;

with ranked as (
  select
    id,
    row_number() over (order by sort_order, created_at, id)::integer as position
  from public.projects
)
update public.projects as projects
set sort_order = ranked.position
from ranked
where projects.id = ranked.id
  and projects.sort_order is distinct from ranked.position;

update public.projects
set featured_order = null
where not is_featured
  and featured_order is not null;

with ranked as (
  select
    id,
    row_number() over (
      order by featured_order nulls last, sort_order, created_at, id
    )::integer as position
  from public.projects
  where is_featured
)
update public.projects as projects
set featured_order = ranked.position
from ranked
where projects.id = ranked.id
  and projects.featured_order is distinct from ranked.position;

alter table public.projects
  drop constraint if exists projects_sort_order_nonnegative,
  drop constraint if exists projects_featured_order_nonnegative;

alter table public.projects
  add constraint projects_sort_order_positive check (sort_order >= 1),
  add constraint projects_featured_order_positive
    check (featured_order is null or featured_order >= 1),
  add constraint projects_featured_order_consistent
    check (
      (is_featured and featured_order is not null)
      or (not is_featured and featured_order is null)
    );

alter table public.projects
  add constraint projects_sort_order_unique
    unique (sort_order) deferrable initially deferred,
  add constraint projects_featured_order_unique
    unique (featured_order) deferrable initially deferred;

create or replace function public.create_project_with_ordering(
  p_slug text,
  p_name text,
  p_category text,
  p_description_ro text,
  p_description_en text,
  p_image_url text,
  p_project_url text,
  p_github_url text,
  p_is_published boolean,
  p_is_featured boolean,
  p_featured_order integer,
  p_sort_order integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_project_id uuid;
  project_count integer;
  featured_count integer;
  target_sort_order integer;
  target_featured_order integer;
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Admin authorization is required.' using errcode = '42501';
  end if;

  if p_sort_order is not null and p_sort_order < 1 then
    raise exception 'Projects page order must be at least 1.' using errcode = '22023';
  end if;

  if p_is_featured and p_featured_order is not null and p_featured_order < 1 then
    raise exception 'Homepage order must be at least 1.' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('public.projects.ordering')
  );
  set constraints all deferred;

  select count(*)::integer
  into project_count
  from public.projects;

  target_sort_order := least(
    greatest(coalesce(p_sort_order, project_count + 1), 1),
    project_count + 1
  );

  update public.projects
  set sort_order = sort_order + 1
  where sort_order >= target_sort_order;

  if p_is_featured then
    select count(*)::integer
    into featured_count
    from public.projects
    where is_featured;

    target_featured_order := least(
      greatest(coalesce(p_featured_order, featured_count + 1), 1),
      featured_count + 1
    );

    update public.projects
    set featured_order = featured_order + 1
    where is_featured
      and featured_order >= target_featured_order;
  else
    target_featured_order := null;
  end if;

  insert into public.projects (
    slug,
    name,
    category,
    description_ro,
    description_en,
    image_url,
    project_url,
    github_url,
    is_published,
    is_featured,
    featured_order,
    sort_order
  )
  values (
    p_slug,
    p_name,
    p_category,
    p_description_ro,
    p_description_en,
    p_image_url,
    p_project_url,
    p_github_url,
    p_is_published,
    p_is_featured,
    target_featured_order,
    target_sort_order
  )
  returning id into new_project_id;

  return new_project_id;
end;
$$;

create or replace function public.update_project_with_ordering(
  p_id uuid,
  p_slug text,
  p_name text,
  p_category text,
  p_description_ro text,
  p_description_en text,
  p_image_url text,
  p_project_url text,
  p_github_url text,
  p_is_published boolean,
  p_is_featured boolean,
  p_featured_order integer,
  p_sort_order integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_sort_order integer;
  old_is_featured boolean;
  old_featured_order integer;
  project_count integer;
  featured_count integer;
  target_sort_order integer;
  target_featured_order integer;
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Admin authorization is required.' using errcode = '42501';
  end if;

  if p_sort_order is not null and p_sort_order < 1 then
    raise exception 'Projects page order must be at least 1.' using errcode = '22023';
  end if;

  if p_is_featured and p_featured_order is not null and p_featured_order < 1 then
    raise exception 'Homepage order must be at least 1.' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('public.projects.ordering')
  );
  set constraints all deferred;

  select sort_order, is_featured, featured_order
  into old_sort_order, old_is_featured, old_featured_order
  from public.projects
  where id = p_id
  for update;

  if not found then
    raise exception 'Project no longer exists.' using errcode = 'P0002';
  end if;

  select count(*)::integer
  into project_count
  from public.projects;

  target_sort_order := least(
    greatest(coalesce(p_sort_order, old_sort_order), 1),
    project_count
  );

  if target_sort_order < old_sort_order then
    update public.projects
    set sort_order = sort_order + 1
    where id <> p_id
      and sort_order >= target_sort_order
      and sort_order < old_sort_order;
  elsif target_sort_order > old_sort_order then
    update public.projects
    set sort_order = sort_order - 1
    where id <> p_id
      and sort_order > old_sort_order
      and sort_order <= target_sort_order;
  end if;

  if old_is_featured and p_is_featured then
    select count(*)::integer
    into featured_count
    from public.projects
    where is_featured;

    target_featured_order := least(
      greatest(coalesce(p_featured_order, old_featured_order), 1),
      featured_count
    );

    if target_featured_order < old_featured_order then
      update public.projects
      set featured_order = featured_order + 1
      where id <> p_id
        and is_featured
        and featured_order >= target_featured_order
        and featured_order < old_featured_order;
    elsif target_featured_order > old_featured_order then
      update public.projects
      set featured_order = featured_order - 1
      where id <> p_id
        and is_featured
        and featured_order > old_featured_order
        and featured_order <= target_featured_order;
    end if;
  elsif old_is_featured and not p_is_featured then
    target_featured_order := null;

    update public.projects
    set featured_order = featured_order - 1
    where id <> p_id
      and is_featured
      and featured_order > old_featured_order;
  elsif not old_is_featured and p_is_featured then
    select count(*)::integer
    into featured_count
    from public.projects
    where is_featured;

    target_featured_order := least(
      greatest(coalesce(p_featured_order, featured_count + 1), 1),
      featured_count + 1
    );

    update public.projects
    set featured_order = featured_order + 1
    where is_featured
      and featured_order >= target_featured_order;
  else
    target_featured_order := null;
  end if;

  update public.projects
  set
    slug = p_slug,
    name = p_name,
    category = p_category,
    description_ro = p_description_ro,
    description_en = p_description_en,
    image_url = p_image_url,
    project_url = p_project_url,
    github_url = p_github_url,
    is_published = p_is_published,
    is_featured = p_is_featured,
    featured_order = target_featured_order,
    sort_order = target_sort_order
  where id = p_id;

  return p_id;
end;
$$;

create or replace function public.delete_project_with_ordering(p_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_sort_order integer;
  old_is_featured boolean;
  old_featured_order integer;
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Admin authorization is required.' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('public.projects.ordering')
  );
  set constraints all deferred;

  select sort_order, is_featured, featured_order
  into old_sort_order, old_is_featured, old_featured_order
  from public.projects
  where id = p_id
  for update;

  if not found then
    raise exception 'Project no longer exists.' using errcode = 'P0002';
  end if;

  delete from public.projects
  where id = p_id;

  update public.projects
  set sort_order = sort_order - 1
  where sort_order > old_sort_order;

  if old_is_featured then
    update public.projects
    set featured_order = featured_order - 1
    where is_featured
      and featured_order > old_featured_order;
  end if;

  return p_id;
end;
$$;

create or replace function public.toggle_project_published(
  p_id uuid,
  p_is_published boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Admin authorization is required.' using errcode = '42501';
  end if;

  update public.projects
  set is_published = p_is_published
  where id = p_id;

  if not found then
    raise exception 'Project no longer exists.' using errcode = 'P0002';
  end if;

  return p_id;
end;
$$;

revoke insert, update, delete on table public.projects from authenticated;

revoke execute on function public.create_project_with_ordering(
  text, text, text, text, text, text, text, text,
  boolean, boolean, integer, integer
) from public, anon;
grant execute on function public.create_project_with_ordering(
  text, text, text, text, text, text, text, text,
  boolean, boolean, integer, integer
) to authenticated;

revoke execute on function public.update_project_with_ordering(
  uuid, text, text, text, text, text, text, text, text,
  boolean, boolean, integer, integer
) from public, anon;
grant execute on function public.update_project_with_ordering(
  uuid, text, text, text, text, text, text, text, text,
  boolean, boolean, integer, integer
) to authenticated;

revoke execute on function public.delete_project_with_ordering(uuid)
from public, anon;
grant execute on function public.delete_project_with_ordering(uuid)
to authenticated;

revoke execute on function public.toggle_project_published(uuid, boolean)
from public, anon;
grant execute on function public.toggle_project_published(uuid, boolean)
to authenticated;
