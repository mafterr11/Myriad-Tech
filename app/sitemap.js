import { getLocalizedUrls } from "@/lib/utils";

const routes = ["home", "projects", "contact", "privacy", "cookies"];

export default function sitemap() {
  return routes.flatMap((route) => {
    const urls = getLocalizedUrls(route);
    const languages = {
      ro: urls.ro,
      en: urls.en,
    };

    return [
      {
        url: urls.ro,
        alternates: { languages },
      },
      {
        url: urls.en,
        alternates: { languages },
      },
    ];
  });
}
