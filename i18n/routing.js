import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ro", "en"],
  defaultLocale: "ro",
  pathnames: {
    "/projects": {
      ro: "/proiecte",
      en: "/projects",
    },
  },
});
