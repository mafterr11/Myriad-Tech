-- Categories become data instead of a hardcoded list.
--
-- Until now a category was a bare string on public.projects, and its label
-- lived in messages/{ro,en}.json under Proiecte.category.*. Adding one meant a
-- code change in three places, so the admin panel could only ever offer the
-- five keys that were compiled into it. This table makes the set editable, and
-- carries both labels so a new category is named by the person creating it
-- rather than by a translator.
--
-- Same model as the rest of the schema: RLS on, public read, and every write
-- through a security definer RPC that checks the admin claim itself.

create table if not exists public.project_categories (
  slug text primary key,
  label_ro text not null,
  label_en text not null,
  sort_order integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint project_categories_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint project_categories_label_ro_present
    check (pg_catalog.length(pg_catalog.btrim(label_ro)) > 0),
  constraint project_categories_label_en_present
    check (pg_catalog.length(pg_catalog.btrim(label_en)) > 0),
  constraint project_categories_sort_order_positive check (sort_order >= 1)
);

-- Deferred so a reorder can swap two rows inside one statement pair without
-- tripping the constraint halfway, exactly as the project sequences do.
alter table public.project_categories
  drop constraint if exists project_categories_sort_order_unique;
alter table public.project_categories
  add constraint project_categories_sort_order_unique
    unique (sort_order) deferrable initially deferred;

create or replace function public.set_project_categories_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.timezone('utc', pg_catalog.now());
  return new;
end;
$$;

drop trigger if exists project_categories_set_updated_at
  on public.project_categories;
create trigger project_categories_set_updated_at
before update on public.project_categories
for each row execute function public.set_project_categories_updated_at();

alter table public.project_categories enable row level security;

revoke all privileges on table public.project_categories from anon, authenticated;
grant select on table public.project_categories to anon, authenticated;

drop policy if exists "Public can read project categories"
  on public.project_categories;
create policy "Public can read project categories"
on public.project_categories
for select
to anon, authenticated
using (true);

-- Seed the five keys the app shipped with, using the labels from the message
-- files so nothing on the site changes the moment this runs.
insert into public.project_categories (slug, label_ro, label_en, sort_order)
values
  ('presentation', 'Site de prezentare', 'Presentation', 1),
  ('progress', 'În desfășurare', 'In progress', 2),
  ('shop', 'Magazin online', 'E-commerce', 3),
  ('wordpress', 'Wordpress', 'Wordpress', 4),
  ('others', 'Altele', 'Others', 5)
on conflict (slug) do nothing;

-- Any category already in use that is not one of those five would otherwise be
-- rejected by the foreign key below. Adopt it, labelled with its own slug, so
-- an existing project is never orphaned by this migration.
insert into public.project_categories (slug, label_ro, label_en, sort_order)
select
  projects.category,
  projects.category,
  projects.category,
  coalesce(
    (select pg_catalog.max(sort_order) from public.project_categories),
    0
  ) + row_number() over (order by projects.category)
from (
  select distinct category
  from public.projects
  where category is not null
    and pg_catalog.length(pg_catalog.btrim(category)) > 0
    and category ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
) as projects
where not exists (
  select 1
  from public.project_categories as existing
  where existing.slug = projects.category
);

-- A project whose category does not match the slug format cannot be pointed at
-- a row, so park it in 'others' rather than letting the foreign key fail.
update public.projects
set category = 'others'
where category is null
  or not exists (
    select 1
    from public.project_categories as categories
    where categories.slug = public.projects.category
  );

-- on update cascade makes renaming a slug re-point every project that uses it;
-- on delete restrict is what stops a category disappearing out from under one.
alter table public.projects
  drop constraint if exists projects_category_fkey;
alter table public.projects
  add constraint projects_category_fkey
    foreign key (category)
    references public.project_categories (slug)
    on update cascade
    on delete restrict;

create index if not exists projects_category_idx on public.projects (category);

create or replace function public.create_project_category(
  p_slug text,
  p_label_ro text,
  p_label_en text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_order integer;
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Admin authorization is required.' using errcode = '42501';
  end if;

  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Category slug must use lowercase letters, numbers, and hyphens.'
      using errcode = '22023';
  end if;

  if p_label_ro is null or pg_catalog.length(pg_catalog.btrim(p_label_ro)) = 0
    or p_label_en is null or pg_catalog.length(pg_catalog.btrim(p_label_en)) = 0 then
    raise exception 'A category needs a Romanian and an English name.'
      using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('public.project_categories.ordering')
  );

  if exists (
    select 1 from public.project_categories where slug = p_slug
  ) then
    raise exception 'A category with this slug already exists.'
      using errcode = '23505';
  end if;

  select coalesce(pg_catalog.max(sort_order), 0) + 1
  into next_order
  from public.project_categories;

  insert into public.project_categories (slug, label_ro, label_en, sort_order)
  values (
    p_slug,
    pg_catalog.btrim(p_label_ro),
    pg_catalog.btrim(p_label_en),
    next_order
  );

  return p_slug;
end;
$$;

revoke execute on function public.create_project_category(text, text, text)
from public, anon;
grant execute on function public.create_project_category(text, text, text)
to authenticated;

-- Renaming the slug rewrites every project that used it, through the cascade on
-- the foreign key, so an edit never strands a project in a category that is no
-- longer there.
create or replace function public.update_project_category(
  p_slug text,
  p_next_slug text,
  p_label_ro text,
  p_label_en text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_slug text;
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Admin authorization is required.' using errcode = '42501';
  end if;

  -- nullif and coalesce are SQL constructs, not catalog functions, so they
  -- need no schema qualification under the empty search_path.
  target_slug := coalesce(nullif(pg_catalog.btrim(p_next_slug), ''), p_slug);

  if target_slug is null or target_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Category slug must use lowercase letters, numbers, and hyphens.'
      using errcode = '22023';
  end if;

  if p_label_ro is null or pg_catalog.length(pg_catalog.btrim(p_label_ro)) = 0
    or p_label_en is null or pg_catalog.length(pg_catalog.btrim(p_label_en)) = 0 then
    raise exception 'A category needs a Romanian and an English name.'
      using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('public.project_categories.ordering')
  );

  if not exists (
    select 1 from public.project_categories where slug = p_slug
  ) then
    raise exception 'Category no longer exists.' using errcode = 'P0002';
  end if;

  if target_slug <> p_slug and exists (
    select 1 from public.project_categories where slug = target_slug
  ) then
    raise exception 'A category with this slug already exists.'
      using errcode = '23505';
  end if;

  update public.project_categories
  set slug = target_slug,
      label_ro = pg_catalog.btrim(p_label_ro),
      label_en = pg_catalog.btrim(p_label_en)
  where slug = p_slug;

  return target_slug;
end;
$$;

revoke execute on function public.update_project_category(text, text, text, text)
from public, anon;
grant execute on function public.update_project_category(text, text, text, text)
to authenticated;

-- Refuses while any project still uses the category, and says how many, so the
-- admin panel can explain the block instead of surfacing a constraint error.
-- The remaining rows are closed up so the sequence stays contiguous.
create or replace function public.delete_project_category(p_slug text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  in_use integer;
  removed_order integer;
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Admin authorization is required.' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('public.project_categories.ordering')
  );
  set constraints all deferred;

  select sort_order
  into removed_order
  from public.project_categories
  where slug = p_slug
  for update;

  if not found then
    raise exception 'Category no longer exists.' using errcode = 'P0002';
  end if;

  select pg_catalog.count(*)
  into in_use
  from public.projects
  where category = p_slug;

  if in_use > 0 then
    raise exception
      'This category is still used by % project(s). Move them to another category first.',
      in_use
      using errcode = '23503';
  end if;

  delete from public.project_categories where slug = p_slug;

  update public.project_categories
  set sort_order = sort_order - 1
  where sort_order > removed_order;

  return p_slug;
end;
$$;

revoke execute on function public.delete_project_category(text) from public, anon;
grant execute on function public.delete_project_category(text) to authenticated;

-- Swap with the neighbour, the same one-step move the project lists use. The
-- sequence is contiguous, so a swap is all a move needs.
create or replace function public.reorder_project_category(
  p_slug text,
  p_offset integer
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_order integer;
  neighbour_slug text;
  neighbour_order integer;
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Admin authorization is required.' using errcode = '42501';
  end if;

  if p_offset is null or p_offset not in (-1, 1) then
    raise exception 'A category can only move one position at a time.'
      using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('public.project_categories.ordering')
  );
  set constraints all deferred;

  select sort_order
  into current_order
  from public.project_categories
  where slug = p_slug
  for update;

  if not found then
    raise exception 'Category no longer exists.' using errcode = 'P0002';
  end if;

  if p_offset < 0 then
    select slug, sort_order
    into neighbour_slug, neighbour_order
    from public.project_categories
    where sort_order < current_order
    order by sort_order desc
    limit 1
    for update;
  else
    select slug, sort_order
    into neighbour_slug, neighbour_order
    from public.project_categories
    where sort_order > current_order
    order by sort_order asc
    limit 1
    for update;
  end if;

  if neighbour_slug is null then
    return p_slug;
  end if;

  update public.project_categories
  set sort_order = current_order
  where slug = neighbour_slug;

  update public.project_categories
  set sort_order = neighbour_order
  where slug = p_slug;

  return p_slug;
end;
$$;

revoke execute on function public.reorder_project_category(text, integer)
from public, anon;
grant execute on function public.reorder_project_category(text, integer)
to authenticated;
