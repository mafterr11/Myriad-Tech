import createNextIntlPlugin from "next-intl/plugin";

const nextConfig = {
  async redirects() {
    return [
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
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
