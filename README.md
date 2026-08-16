# Myriad Tech portfolio

This is a Next.js 16 portfolio with Romanian and English routes. Public project content is stored in Supabase and managed from the protected admin panel.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. The publishable key is safe for browser use; do not add a service-role or secret key to this app.

The existing contact form also needs the reCAPTCHA and Resend variables shown in `.env.example`.

## Supabase setup

The migration in `supabase/migrations/20260806202236_project_system_and_storage.sql` creates:

- `public.projects` with explicit Data API grants and RLS;
- public reads for published projects and admin-only CRUD using `app_metadata.role = 'admin'`;
- the public `project-images` bucket with admin-only Storage management policies;
- idempotent, preservation-safe seeds for the portfolio projects that previously lived in `data.js` (rerunning them does not overwrite admin edits, featured choices, or ordering).

The migration in `supabase/migrations/20260813120000_site_images_and_project_reordering.sql` adds:

- `public.site_images`, holding the homepage hero and about images with per-locale alternative text, readable by everyone and writable only through the admin-only `upsert_site_image` RPC;
- the public `site-images` bucket with the same admin-only Storage policies as `project-images`;
- `reorder_project`, which swaps a project with its neighbour in either ordering sequence so the panel can move items one position at a time.

The seed rows reproduce the images that used to be hardcoded in the components. Until the migration is applied, the site and the admin panel fall back to exactly those values, so nothing breaks while the migration is pending.

Apply the migrations through the Supabase SQL editor or with the Supabase CLI after linking the intended project:

```bash
npx supabase db push
```

Create an Auth user, then set that user's `app_metadata.role` to `admin` in Supabase Auth administration. Do not use `user_metadata` for authorization. The application verifies the signed identity with `supabase.auth.getClaims()` on the server and repeats authorization in every mutation.

Open `/ro/admin-login` or `/en/admin-login` to access the panel.

**Projects tab** — counts for total/published/draft/homepage projects, search by name, slug or category, filtering by status, creation, editing, deletion, publish/unpublish, live image previews, local image paths or public `project-images` Storage URLs, Storage API uploads, numeric ordering, one-click move up/down for both the projects page order and the homepage order, and homepage featured selection.

**Site images tab** — replaces the homepage hero and about images from an upload or a URL, edits the Romanian and English alternative text, and restores the built-in defaults. Reordering is disabled while a search or filter is active, because positions apply to the full list rather than the filtered view.

## Why the portfolio never renders empty

Public project reads go through `lib/projects/queries.js`, which layers four
things so an unreachable database can never blank the homepage carousel or the
projects page:

1. an anonymous, cookie-free Supabase client (`lib/supabase/public.js`) with a
   3.5s request timeout, so a stalled connection fails fast instead of hanging
   the render;
2. the Next.js data cache, tagged `projects` and refreshed every five minutes;
   admin mutations call `revalidateTag`, so edits still appear immediately;
3. a per-instance memory of the last successful response;
4. `lib/projects/snapshot.js`, a committed copy of the published projects.

Only a *successful* read that returns nothing empties the page, which is what
should happen when everything is genuinely unpublished. On the homepage, a
missing featured selection also falls back to the newest published work.

Regenerate the snapshot after publishing, unpublishing or reordering projects:

```bash
node scripts/generate-project-snapshot.mjs
```

## Keeping Supabase awake

A Supabase project on the free plan pauses after seven days without database
activity. `app/api/cron/keep-alive/route.js` performs one cheap count, and
`vercel.json` schedules it daily at 06:00 UTC.

Set `CRON_SECRET` in the Vercel project environment variables. Vercel sends it
as `Authorization: Bearer <CRON_SECRET>`; the route refuses every request
without it, and refuses all of them while the variable is unset. Test it with:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://www.myriad-tech.ro/api/cron/keep-alive
```

## Icons and social images

`public/icon.svg` is the favicon, drawn from the four-blade logo mark.

`app/apple-icon.jsx` and `app/opengraph-image.jsx` render the 180x180 iOS icon
and the 1200x630 link-preview card from `lib/brand.js`, so a colour change only
has to happen in one place. `app/robots.js`, `app/sitemap.js` and
`app/manifest.js` derive every absolute URL from `SITE_URL` in `lib/utils.ts`.

Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to emit the Search Console
verification tag.

## Verification

```bash
npm run build
npm ls @supabase/supabase-js @supabase/ssr
rg -n "service_role|SUPABASE_SECRET|SUPABASE_SERVICE" app components lib proxy.js .env.example
```

The production build does not require live Supabase credentials: public pages render their empty/error state until the variables and migration are configured.
