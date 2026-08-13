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

## Verification

```bash
npm run build
npm ls @supabase/supabase-js @supabase/ssr
rg -n "service_role|SUPABASE_SECRET|SUPABASE_SERVICE" app components lib proxy.js .env.example
```

The production build does not require live Supabase credentials: public pages render their empty/error state until the variables and migration are configured.
