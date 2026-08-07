import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ro", "en"],
  defaultLocale: "ro",
  alternateLinks: false,
  pathnames: {
    "/projects": {
      ro: "/proiecte",
      en: "/projects",
    },
  },
});
