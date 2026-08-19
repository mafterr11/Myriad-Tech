# Myriad Tech — project notes

Next.js 16 (App Router, Turbopack) + next-intl, Supabase, deployed on Vercel.

## Canonical host

- `SITE_URL` in `lib/utils.ts` is the single source for every absolute URL:
  canonicals, `alternates.languages`, sitemap, robots, JSON-LD, OG images.
  Change the host there and nowhere else.
- **The www/non-www redirect lives in the Vercel dashboard, not in
  `next.config.mjs`.** Vercel answers the host redirect at the edge before the
  request reaches the app, so a `has: [{ type: "host" }]` rule in the config
  pointing the opposite way makes the two bounce forever
  (`ERR_TOO_MANY_REDIRECTS`, whole site down — happened 2026-08-18, commits
  `07a7b71` then `3d3b294`).
- Whichever host Vercel marks primary **must** match `SITE_URL`, or the
  canonical tag points at a URL that redirects and Google ignores it.
- Verify a host change with the redirect chain, not just a browser load:
  `curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://myriad-tech.ro/ro`

## Icons

- `public/icon.svg` — browser-tab favicon (SVG).
- `app/favicon.ico` — 16/32/48px ICO for crawlers that hit `/favicon.ico`
  directly. Regenerate with `node scripts/generate-favicon.mjs` (uses `sharp`,
  already present via Next; hand-packs the ICO container).
- Setting a manual `icons` object in `constructMetadata` **suppresses** the tag
  Next auto-injects for `app/favicon.ico`, so `/favicon.ico` has to be listed
  in that object explicitly.
- `app/apple-icon.jsx` and `app/opengraph-image.jsx` draw from
  `components/brand-mark.jsx`, built out of plain boxes rather than embedded
  SVG — satori rasterises through libvips on the Vercel builder, which fails on
  SVG data URIs even though the local backend accepts them.

## Voice and copy

- **One person, not a team.** Everything user-facing is first person
  singular — "I build", "dezvoltator independent". Never "we", "our team",
  "studio". The 2026-08-19 pass removed the last of it from `Services`,
  `About.tab1`, `Cta` and `Footer` in both message files.
- Hero keys are `title` / `status` / `description` / `caption`. The old
  `subtitle` + `subtitle2` + `subtitle3` split printed the location three
  times on one screen; `status` now carries availability, not a place.

## Rendering and caching

- Public data (`lib/projects/queries.js`, `lib/site-images/queries.js`) goes
  through `unstable_cache` with tags, and every admin mutation calls
  `revalidatePath` over `PUBLIC_PROJECT_PATHS` / `SITE_IMAGE_PATHS`. So the
  homepage and projects page use `export const revalidate = 3600`, not
  `force-dynamic` — an admin edit is still live immediately.
- `force-dynamic` on those pages **disabled `unstable_cache` entirely**, so
  every visit hit Supabase. Do not put it back.
- Every route under `[locale]` still reports `ƒ` in the build table and
  nothing lands in `.next/prerender-manifest.json`, even with
  `generateStaticParams` on the layout, `setRequestLocale` in each page, and
  an explicit `app/layout.jsx`. `force-static` on a page succeeds without
  error, so the pages *can* prerender — Next just does not choose to. Cause
  not yet isolated; the data caching above is what actually mattered, so this
  is cosmetic. Don't burn time on it again without a new lead.

## Security

- Security headers live in `headers()` in `next.config.mjs`. **Adding any
  third-party script, embed, font or API means adding its origin to the CSP
  there**, or the browser silently blocks it. Currently allowed: Google
  Tag Manager/Analytics, reCAPTCHA (`google.com` + `gstatic.com`, plus
  `frame-src` for its iframe), Supabase storage, and the Vercel beacon.
  `script-src` keeps `'unsafe-inline'`/`'unsafe-eval'` because Next inlines
  its bootstrap; removing them needs per-request nonces.
- After changing the CSP, load a page and check the console — a wrong policy
  fails silently and takes reCAPTCHA down with it, which kills the contact
  form.
- **Supabase advisors flag the six admin RPCs as "callable by signed-in
  users". That lint is a false positive here.** It does not read function
  bodies, and all six (`create/update/delete_project_with_ordering`,
  `toggle_project_published`, `reorder_project`, `upsert_site_image`) open
  with the same guard:
  `if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then raise exception`.
  That matches `isAdminClaims` in `lib/admin/auth.js`. The base tables also
  revoke insert/update/delete from `anon` and `authenticated`, so the RPCs
  are the only write path. Signup, anonymous sign-ins and manual linking are
  all disabled in the dashboard. Don't "fix" this lint.

## Animation

- **Nothing above the fold animates in.** `variants.jsx` `fadeIn` starts at
  `opacity: 0`; on the hero that kept the LCP text and portrait invisible
  until hydration finished. `Hero.jsx` renders plain elements now. Sections
  further down still use `whileInView`.
- The `prefers-reduced-motion` block in `globals.css` only shortens **CSS**
  transitions. Framer Motion drives its variants from JavaScript and ignores
  it, so `lib/motion-client.js` checks `useReducedMotion` itself and flattens
  every variant to the settled state. Lenis opts out of smooth scroll the
  same way.

## Routing

- `proxy.js` (not `middleware.js`) holds the next-intl middleware; its matcher
  excludes the extensionless metadata routes (`/opengraph-image`, `/apple-icon`,
  `/icon`, `/manifest`, `/sitemap`, `/robots`) so they are not localized.
- Localized path pairs are declared in `localizedRoutes` in `lib/utils.ts`;
  legacy unprefixed paths are 301'd in `next.config.mjs`.
- A localized slug lives in **three** places that must agree: `pathnames` in
  `i18n/routing.js` (keyed by the folder name under `app/[locale]`),
  `localizedRoutes` in `lib/utils.ts` (canonical + hreflang + sitemap), and a
  legacy redirect in `next.config.mjs`. The English legal pages moved off the
  Romanian slugs this way (`/en/privacy-policy`, `/en/cookie-policy`).
