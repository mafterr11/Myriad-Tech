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
- **reCAPTCHA needs `https://www.google.com` in `connect-src`, not just
  `script-src` and `frame-src`.** Once the widget has a token it XHRs to
  `https://www.google.com/recaptcha/api2/clr`. That origin was missing, so
  every contact-page visit logged a run of "Refused to connect ... violates
  the following Content Security Policy directive: connect-src" (fixed
  2026-08-26). The form still worked -- the call is telemetry, not the token
  exchange -- which is exactly why it went unnoticed.
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

### Intro panel (first visit) and route curtain

- `components/layout/IntroOverlay.jsx` renders the accent panel into the SSR
  HTML and animates it with **plain CSS keyframes**, not framer. Framer could
  only start after hydration, which on a cold load is long after first paint,
  so the hero would flash and then get covered.
- **The boot script must never add or remove a node.** Everything under
  `<body>` is React's. The first version deleted the panel before hydration
  and that broke it outright: hydration mismatch, then
  `insertBefore`/`removeChild` NotFoundErrors on the next route change, and
  Next fell back to a full page load for every navigation. The script only
  sets `intro-active` on `<html>`; CSS decides whether the panel is
  displayed. `<html>` carries `suppressHydrationWarning` for that class (and
  for the one Lenis adds).
- Shown once per tab via `sessionStorage` key `mt-intro-seen`; skipped for
  `prefers-reduced-motion` and for `/admin`. Note that a tab opened from an
  existing one (middle click, duplicate) inherits `sessionStorage`, so it
  counts as the same session and gets no intro. That is intended.
- **`IntroCleanup` ends the intro on `animationend`, never on a timer.** A
  clock broke it two ways, both of them showing up when several tabs were
  opened at once: a hidden tab has its document timeline frozen, so the
  keyframes sit at frame 0 while the timeout counts down and pulls the class
  out from under them; and three tabs loading at once starve the CPU, so
  hydration can land after the intro's nominal end, which made the remaining
  time compute to zero and cut the panel the moment React mounted. The 9s
  fallback timer refuses to fire while `visibilityState` is hidden -- a frozen
  animation is not a stuck one.
- Timings: intro runs 2.4s end to end, in the `html.intro-active` keyframes
  in globals.css. The curtain is in the `TIMING` table in CurtainProvider:
  `full` (~1.6s) for the first route change of a session, `trim` (~1.2s) for
  every one after, tracked with `sessionStorage` key `mt-curtain-seen`.
- **The curtain always runs -- only its length changes.** It is not just
  decoration: it covers the RSC fetch so a slow route reads as intentional
  rather than frozen, and it hides the jump back to the top of the page. Gate
  it off after the first navigation and clicks behave two different ways in
  one session, which reads as a bug rather than as restraint.
- In each `TIMING` entry the mark must finish no later than the panel
  (`markDelay + markIn <= panelDelay + cover`). Framer holds the parent's
  `onAnimationComplete` until its children settle, so a slow mark stretches
  the whole cover phase.
- The hero is still untouched, so it paints behind the panel and remains the
  LCP candidate. Do not start animating it.
- Route changes go through `CurtainProvider`. Framer alone cannot do a
  leave-then-enter transition in the App Router -- by the time `children`
  changes the old tree is gone -- so `TransitionLink` (a drop-in for the
  next-intl `Link`, imported in place of it everywhere) hands the click to the
  provider, which pushes the route while the curtain is on its way in.
  `LocalSwitcher` calls the same `navigate` with `{ replace: true }`.
- `.curtain-root` is `pointer-events: none` **always**, and every phase has a
  watchdog deadline. A backgrounded tab stops rAF, which freezes framer
  mid-sweep and means `onAnimationComplete` may never fire; without both of
  those the curtain would sit over the page swallowing every click.
- **Nothing in a page's first screen may use `animate="show"`.** A
  mount-triggered variant fires the moment the route commits, which is while
  the curtain is still covering the page, so it plays to nobody and leaves an
  LCP candidate parked at `opacity: 0`. Same rule as the hero, same reason.
  The projects h1 and the whole contact header were stripped on 2026-08-26.
- `whileInView` is fine and was left alone. Near the fold on a big monitor it
  simply settles behind the curtain, which is the no-animation outcome we
  wanted anyway; further down, and on phones, it still animates on scroll.
  Gating it on the curtain would mean plumbing curtain state through
  `lib/motion-client.js` into every animated component on the site, and would
  push content settling out to ~2.5s after a click. Not worth it.
- Back/forward buttons get no curtain (nothing to intercept) -- the swap is
  instant. That is deliberate, not a bug.
- **Animations cannot be verified in a headless browser pane.** The tab there
  reports `visibilityState: "hidden"`, which freezes the document timeline
  for CSS and framer alike -- transforms sit at their t=0 value forever.
  Check the state machine and the DOM instead, and eyeball the motion in a
  real window.

## Toasts

- `components/ui/toast.jsx` is no longer stock shadcn. The original shipped a
  `dark:` palette, and Tailwind resolves `dark:` through
  `prefers-color-scheme` regardless of the `colorScheme: "light"` in the
  layout viewport -- so on a machine set to dark mode the toast turned
  near-black while every other surface stayed paper. **Do not reintroduce
  `dark:` variants anywhere; the site has no dark theme.**
- Three variants: `default` (accent), `success` (teal), `destructive` (red).
  Each sets a left rail, a glyph and the progress bar from the same colour.
  `ContactForm` passes `success` and `destructive`.
- The progress bar animation in globals.css is 5s and `ToastProvider` pins
  `duration={5000}`. **Change one and change the other**, or the bar and the
  dismiss stop agreeing. Radix pauses its timer on hover, which is why the bar
  pauses on `.group:hover`.
- `ToastClose` is always visible. Stock kept it at `opacity: 0` until hover,
  which leaves no way to dismiss a toast on a touch screen.

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
