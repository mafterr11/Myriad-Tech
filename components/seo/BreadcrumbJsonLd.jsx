import { SITE_URL, getLocalizedUrls } from "@/lib/utils";
import JsonLd from "./JsonLd";

const labels = {
  ro: {
    home: "Acasă",
    projects: "Proiecte",
    contact: "Contact",
    privacy: "Politica de confidențialitate",
    cookies: "Politica privind cookie-urile",
  },
  en: {
    home: "Home",
    projects: "Projects",
    contact: "Contact",
    privacy: "Privacy policy",
    cookies: "Cookie policy",
  },
};

// The site has no visible breadcrumb trail, but the two-level hierarchy is real
// and it is what search results render under the title.
export default function BreadcrumbJsonLd({ locale, route }) {
  const language = locale === "en" ? "en" : "ro";
  const label = labels[language];
  const home = getLocalizedUrls("home")[language];
  const current = getLocalizedUrls(route)[language];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${current}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: label.home,
        item: home,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: label[route],
        item: current,
      },
    ],
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return <JsonLd data={structuredData} />;
}
