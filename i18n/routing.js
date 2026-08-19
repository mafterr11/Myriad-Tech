import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ro", "en"],
  defaultLocale: "ro",
  alternateLinks: false,
  // Keys are the folder names under app/[locale]; the values are the public
  // URL each locale gets. Keep these in sync with `localizedRoutes` in
  // lib/utils.ts, which builds the canonical and hreflang tags from the same
  // pairs, and with the legacy redirects in next.config.mjs.
  pathnames: {
    "/projects": {
      ro: "/proiecte",
      en: "/projects",
    },
    "/politica-de-confidentialitate": {
      ro: "/politica-de-confidentialitate",
      en: "/privacy-policy",
    },
    "/politica-cookies": {
      ro: "/politica-cookies",
      en: "/cookie-policy",
    },
  },
});
