create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description_ro text not null,
  description_en text not null,
  image_url text not null,
  project_url text not null,
  github_url text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  featured_order integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint projects_featured_order_nonnegative check (featured_order is null or featured_order >= 0),
  constraint projects_sort_order_nonnegative check (sort_order >= 0)
);

create index if not exists projects_public_sort_idx
  on public.projects (is_published, sort_order, created_at desc);

create index if not exists projects_featured_sort_idx
  on public.projects (is_published, is_featured, featured_order, sort_order);

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

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_projects_updated_at();

alter table public.projects enable row level security;

grant usage on schema public to anon, authenticated;
revoke all privileges on table public.projects from anon, authenticated;
grant select on table public.projects to anon;
grant select, insert, update, delete on table public.projects to authenticated;

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

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

insert into public.projects (
  id,
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
values
  (
    '11111111-1111-4111-8111-111111111111',
    'madiny-tattoo',
    'MadinyTattoo',
    'presentation',
    'Acesta este un site web modern minimalist cu un fundal video captivant pe pagina de start. Platforma aduce arta corporală la viață cu măiestrie, oferind o experiență digitală imersivă.',
    'This is a modern, minimalist website with a captivating video background on the homepage. The platform masterfully brings body art to life, offering an immersive digital experience.',
    '/work/madinytattoo.png',
    'https://madinytattoo.ro',
    null,
    true,
    true,
    1,
    1
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'monte-bianco',
    'Monte Bianco',
    'presentation',
    'Acest site web include un meniu dropdown mobil intuitiv, facilitând o navigare ușoară, iar designul web modern asigură o utilizare optimă pe toate platformele.',
    'This website features an intuitive mobile dropdown menu, ensuring easy navigation, while the modern web design guarantees optimal usability across all platforms.',
    '/work/monte-bianco.png',
    'https://www.montebianco.ro/',
    null,
    true,
    true,
    2,
    2
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'tng-grup',
    'TNG GRUP',
    'presentation',
    'Un site de prezentare ce include un formular de contact complex personalizat, securitate îmbunătățită cu reCaptcha.',
    'A presentation website that includes a complex, custom contact form with enhanced security through reCaptcha.',
    '/work/tng.png',
    'https://tngag.ro',
    null,
    true,
    true,
    3,
    3
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'bava-gaz-construct',
    'BAVA GAZ CONSTRUCT',
    'presentation',
    'Un site modern și bine structurat, cu un design clar și intuitiv dedicat prezentării serviciilor profesionale din domeniul instalațiilor de gaze și sanitare.',
    'A modern and well-structured website with a clear and intuitive design, dedicated to showcasing professional services in the field of gas and sanitary installations.',
    '/work/bavagaz.png',
    'https://www.bavagazconstruct.ro',
    null,
    true,
    true,
    4,
    4
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'mbody-evolution',
    'MBody Evolution',
    'presentation',
    'Disponibil în română și engleză, acest site de prezentare se remarcă printr-o experiență interactivă datorită animațiilor fluide și unui design web modern.',
    'Available in both Romanian and English, this presentation website stands out with an interactive experience thanks to smooth animations and a modern web design.',
    '/work/mbody.png',
    'https://mbody.vercel.app',
    null,
    true,
    true,
    5,
    5
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'myriad-ai',
    'Myriad-AI',
    'presentation',
    'Datorită integrării CMS, clienții pot gestiona cu ușurință conținutul, făcând actualizările și personalizarea o experiență fără efort.',
    'Thanks to CMS integration, clients can easily manage content, making updates and customization a seamless experience.',
    '/work/myriad-AI.png',
    'https://myriad-ai.vercel.app',
    null,
    true,
    true,
    6,
    6
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    'dianazu',
    'DianaZU',
    'presentation',
    'O pagină de portofoliu simplă, dezvoltată cu smooth scrolling și o bară de încărcare dinamică.',
    'A simple portfolio page, developed with smooth scrolling and a dynamic loading bar.',
    '/work/dianazu.png',
    'https://dianazu.vercel.app',
    null,
    true,
    true,
    7,
    7
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    'minions-unite',
    'minionsUnite',
    'shop',
    'Acest magazin online oferă o autentificare securizată, garantând clienților o experiență de cumpărături simplă și sigură. Ideal pentru afaceri care necesită un magazin online versatil și fiabil.',
    'This online store provides secure authentication, ensuring a simple and safe shopping experience for customers. Ideal for businesses that need a versatile and reliable online store.',
    '/work/minionsUnite.png',
    'https://ecommerce-template-demo.vercel.app',
    null,
    true,
    true,
    8,
    8
  ),
  (
    '99999999-9999-4999-8999-999999999999',
    'chilli-ink',
    'Chilli Ink Tattoo',
    'wordpress',
    'Tattoo studio website, with a modern and clean design, showcasing the studio''s services and portfolio.',
    'Tattoo studio website, with a modern and clean design, showcasing the studio''s services and portfolio.',
    '/work/chillInk.png',
    'https://chilli-ink.ro',
    null,
    true,
    true,
    9,
    9
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'multi-step-form',
    'Multi-Step Form',
    'others',
    'Am dezvoltat un formular multi-step, special conceput pentru evenimentele dealerilor auto, cu un focus pe interfața de utilizare prietenoasă și navigarea intuitivă, oferind o experiență de utilizare simplă și eficientă.',
    'I developed a multi-step form specifically designed for auto dealer events, focusing on a user-friendly interface and intuitive navigation, providing a smooth and efficient user experience.',
    '/work/PIA.jpg',
    'https://offerfest-pia.vercel.app',
    null,
    true,
    true,
    10,
    10
  )
on conflict (slug) do nothing;
