import createNextIntlPlugin from "next-intl/plugin";

// Every origin the site actually talks to. Adding a third-party script, embed
// or API means adding it here too, or the browser will block it.
//   - Google Tag Manager / Analytics: components/google-analytics.js
//   - reCAPTCHA v3: app/[locale]/contact/page.jsx. It needs google.com +
//     gstatic.com in script-src, an iframe in frame-src, *and* google.com in
//     connect-src: once it has a token the widget XHRs to
//     https://www.google.com/recaptcha/api2/clr. That last one was missing and
//     the console filled with "Refused to connect" on every contact visit.
//   - Supabase: project and site images served from storage
//   - Vercel: @vercel/analytics beacon
// 'unsafe-inline' and 'unsafe-eval' stay in script-src because Next.js inlines
// its bootstrap and hydration payload; removing them needs per-request nonces,
// which is a bigger change than this. style-src needs 'unsafe-inline' for the
// inline styles Next and Framer Motion emit.
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://region1.google-analytics.com https://va.vercel-scripts.com https://www.google.com https://recaptcha.google.com",
  "frame-src https://www.google.com https://recaptcha.google.com",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Vercel serves the site over HTTPS only; two years with preload is the
  // value the preload list requires.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // The www/non-www redirect belongs to the Vercel domain settings, not
      // here: Vercel answers it before the app is reached, so a rule in this
      // file pointing the other way produces an infinite redirect loop.
      // Whichever host is marked primary in the dashboard has to match
      // SITE_URL in lib/utils.ts.
      {
        source: "/",
        destination: "/ro",
        permanent: true,
      },
      {
        source: "/projects",
        destination: "/ro/proiecte",
        permanent: true,
      },
      {
        source: "/proiecte",
        destination: "/ro/proiecte",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/ro/contact",
        permanent: true,
      },
      {
        source: "/politica-de-confidentialitate",
        destination: "/ro/politica-de-confidentialitate",
        permanent: true,
      },
      {
        source: "/politica-cookies",
        destination: "/ro/politica-cookies",
        permanent: true,
      },
      {
        source: "/en/proiecte",
        destination: "/en/projects",
        permanent: true,
      },
      {
        source: "/ro/projects",
        destination: "/ro/proiecte",
        permanent: true,
      },
      // The English legal pages used to be served under the Romanian slugs.
      {
        source: "/en/politica-de-confidentialitate",
        destination: "/en/privacy-policy",
        permanent: true,
      },
      {
        source: "/en/politica-cookies",
        destination: "/en/cookie-policy",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/project-images/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/site-images/**",
        search: "",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
