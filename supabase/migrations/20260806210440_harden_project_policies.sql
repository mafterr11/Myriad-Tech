create or replace function public.set_projects_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.timezone('utc', pg_catalog.now());
  return new;
end;
$$;

drop policy if exists "Anyone can read published projects" on public.projects;
drop policy if exists "Admins can read all projects" on public.projects;
drop policy if exists "Public can read published projects" on public.projects;
drop policy if exists "Authenticated users can read projects" on public.projects;

create policy "Public can read published projects"
on public.projects
for select
to anon
using (is_published = true);

create policy "Authenticated users can read projects"
on public.projects
for select
to authenticated
using (
  is_published = true
  or ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can create projects" on public.projects;
create policy "Admins can create projects"
on public.projects
for insert
to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects"
on public.projects
for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects"
on public.projects
for delete
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can list project images" on storage.objects;
create policy "Admins can list project images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'project-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can upload project images" on storage.objects;
create policy "Admins can upload project images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can update project images" on storage.objects;
create policy "Admins can update project images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'project-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  bucket_id = 'project-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can delete project images" on storage.objects;
create policy "Admins can delete project images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-images'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);
