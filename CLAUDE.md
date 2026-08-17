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

## Routing

- `proxy.js` (not `middleware.js`) holds the next-intl middleware; its matcher
  excludes the extensionless metadata routes (`/opengraph-image`, `/apple-icon`,
  `/icon`, `/manifest`, `/sitemap`, `/robots`) so they are not localized.
- Localized path pairs are declared in `localizedRoutes` in `lib/utils.ts`;
  legacy unprefixed paths are 301'd in `next.config.mjs`.
