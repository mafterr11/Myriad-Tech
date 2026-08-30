-- Editable homepage imagery (hero + about) and one-click project reordering.
-- Both additions follow the existing model: RLS-protected tables, public read
-- for published content, and admin-only mutations through security definer RPCs.

create table if not exists public.site_images (
  key text primary key,
  image_url text not null,
  alt_ro text not null default '',
  alt_en text not null default '',
  updated_at timestamptz not null default timezone('utc', now()),
  constraint site_images_key_allowed check (key in ('hero', 'about')),
  constraint site_images_image_url_present
    check (pg_catalog.length(pg_catalog.btrim(image_url)) > 0)
);

create or replace function public.set_site_images_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.timezone('utc', pg_catalog.now());
  return new;
end;
$$;

drop trigger if exists site_images_set_updated_at on public.site_images;
create trigger site_images_set_updated_at
before update on public.site_images
for each row execute function public.set_site_images_updated_at();

alter table public.site_images enable row level security;

revoke all privileges on table public.site_images from anon, authenticated;
grant select on table public.site_images to anon, authenticated;

drop policy if exists "Public can read site images" on public.site_images;
create policy "Public can read site images"
on public.site_images
for select
to anon, authenticated
using (true);

-- Seed the images that were previously hardcoded in the Hero and About
-- components so the site keeps rendering exactly as before this migration.
insert into public.site_images (key, image_url, alt_ro, alt_en)
values
  (
    'hero',
    '/alexandru-maftei-hero.jpeg',
    'Alexandru Maftei, dezvoltator full stack',
    'Alexandru Maftei, Full Stack Developer'
  ),
  (
    'about',
    '/about-option-2-process-v2.png',
    'Proces de web design cu schite de site',
    'Web design process with website wireframes'
  )
on conflict (key) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images',
  'site-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can list site images" on storage.objects;
create policy "Admins can list site images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'site-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can upload site images" on storage.objects;
create policy "Admins can upload site images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can update site images" on storage.objects;
create policy "Admins can update site images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  bucket_id = 'site-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can delete site images" on storage.objects;
create policy "Admins can delete site images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

create or replace function public.upsert_site_image(
  p_key text,
  p_image_url text,
  p_alt_ro text,
  p_alt_en text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Admin authorization is required.' using errcode = '42501';
  end if;

  if p_key is null or p_key not in ('hero', 'about') then
    raise exception 'Unknown site image.' using errcode = '22023';
  end if;

  if p_image_url is null or pg_catalog.length(pg_catalog.btrim(p_image_url)) = 0 then
    raise exception 'A site image needs an image URL.' using errcode = '22023';
  end if;

  insert into public.site_images (key, image_url, alt_ro, alt_en)
  values (p_key, p_image_url, coalesce(p_alt_ro, ''), coalesce(p_alt_en, ''))
  on conflict (key) do update
  set image_url = excluded.image_url,
      alt_ro = excluded.alt_ro,
      alt_en = excluded.alt_en;

  return p_key;
end;
$$;

revoke execute on function public.upsert_site_image(text, text, text, text)
from public, anon;
grant execute on function public.upsert_site_image(text, text, text, text)
to authenticated;

-- Swap a project with its neighbour in either ordering sequence. Both sequences
-- stay contiguous, so a swap is all that is needed to move an item one step.
create or replace function public.reorder_project(
  p_id uuid,
  p_scope text,
  p_offset integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  project_is_featured boolean;
  project_sort_order integer;
  project_featured_order integer;
  current_order integer;
  neighbour_id uuid;
  neighbour_order integer;
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Admin authorization is required.' using errcode = '42501';
  end if;

  if p_scope is null or p_scope not in ('page', 'featured') then
    raise exception 'Unknown ordering scope.' using errcode = '22023';
  end if;

  if p_offset is null or p_offset not in (-1, 1) then
    raise exception 'A project can only move one position at a time.'
      using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('public.projects.ordering')
  );
  set constraints all deferred;

  select is_featured, sort_order, featured_order
  into project_is_featured, project_sort_order, project_featured_order
  from public.projects
  where id = p_id
  for update;

  if not found then
    raise exception 'Project no longer exists.' using errcode = 'P0002';
  end if;

  if p_scope = 'featured' then
    if not project_is_featured then
      raise exception 'Only homepage projects have a homepage position.'
        using errcode = '22023';
    end if;

    current_order := project_featured_order;

    if p_offset < 0 then
      select id, featured_order
      into neighbour_id, neighbour_order
      from public.projects
      where is_featured
        and featured_order < current_order
      order by featured_order desc
      limit 1
      for update;
    else
      select id, featured_order
      into neighbour_id, neighbour_order
      from public.projects
      where is_featured
        and featured_order > current_order
      order by featured_order asc
      limit 1
      for update;
    end if;

    if neighbour_id is null then
      return p_id;
    end if;

    update public.projects
    set featured_order = current_order
    where id = neighbour_id;

    update public.projects
    set featured_order = neighbour_order
    where id = p_id;

    return p_id;
  end if;

  current_order := project_sort_order;

  if p_offset < 0 then
    select id, sort_order
    into neighbour_id, neighbour_order
    from public.projects
    where sort_order < current_order
    order by sort_order desc
    limit 1
    for update;
  else
    select id, sort_order
    into neighbour_id, neighbour_order
    from public.projects
    where sort_order > current_order
    order by sort_order asc
    limit 1
    for update;
  end if;

  if neighbour_id is null then
    return p_id;
  end if;

  update public.projects
  set sort_order = current_order
  where id = neighbour_id;

  update public.projects
  set sort_order = neighbour_order
  where id = p_id;

  return p_id;
end;
$$;

revoke execute on function public.reorder_project(uuid, text, integer)
from public, anon;
grant execute on function public.reorder_project(uuid, text, integer)
to authenticated;
