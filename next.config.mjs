import createNextIntlPlugin from "next-intl/plugin";

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
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
