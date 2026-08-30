-- Keep Storage enforcement aligned with the server-side image validator.
-- Both upload paths accept only these four formats and cap files at 4 MiB.
update storage.buckets
set
  file_size_limit = 4194304,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif'
  ]::text[]
where id in ('project-images', 'site-images');
