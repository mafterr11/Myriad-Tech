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

Apply the migration through the Supabase SQL editor or with the Supabase CLI after linking the intended project:

```bash
npx supabase db push
```

Create an Auth user, then set that user's `app_metadata.role` to `admin` in Supabase Auth administration. Do not use `user_metadata` for authorization. The application verifies the signed identity with `supabase.auth.getClaims()` on the server and repeats authorization in every mutation.

Open `/ro/admin-login` or `/en/admin-login` to access the panel. The panel supports project creation, editing, deletion, publish/unpublish, local image paths or public `project-images` Storage URLs, Storage API uploads, ordering, and homepage featured selection/order.

## Verification

```bash
npm run build
npm ls @supabase/supabase-js @supabase/ssr
rg -n "service_role|SUPABASE_SECRET|SUPABASE_SERVICE" app components lib proxy.js .env.example
```

The production build does not require live Supabase credentials: public pages render their empty/error state until the variables and migration are configured.
