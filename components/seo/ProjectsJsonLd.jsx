import { SITE_URL, getLocalizedUrls } from "@/lib/utils";
import JsonLd from "./JsonLd";

// Describes the portfolio grid as an ordered list of real work, which is what
// lets a search engine connect this site to the client sites it links out to.
export default function ProjectsJsonLd({ locale, projects = [] }) {
  const language = locale === "en" ? "en" : "ro";
  const url = getLocalizedUrls("projects")[language];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    inLanguage: language,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "WebSite",
          name: project.name,
          url: project.link || url,
          description: project.description || undefined,
          image: project.image?.startsWith("http")
            ? project.image
            : project.image
              ? `${SITE_URL}${project.image}`
              : undefined,
          creator: { "@id": `${SITE_URL}/#organization` },
        },
      })),
    },
  };

  return <JsonLd data={structuredData} />;
}
