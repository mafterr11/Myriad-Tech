import { SITE_NAME, SITE_URL } from "@/lib/utils";

export default function OrganizationJsonLd({ locale }) {
  const isRomanian = locale !== "en";
  const description = isRomanian
    ? "Servicii de web design, dezvoltare web și optimizare SEO pentru afaceri din București și din România."
    : "Web design, web development and SEO services for businesses in Bucharest, Romania and beyond.";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/Myriad%20Tech%20logo.png`,
        image: `${SITE_URL}/alexandru-maftei-hero.jpeg`,
        description,
        email: "alexandrumaftei95@gmail.com",
        telephone: "+40720425840",
        founder: {
          "@type": "Person",
          "@id": `${SITE_URL}/#alexandru-maftei`,
          name: "Alexandru Maftei",
          jobTitle: isRomanian
            ? "Dezvoltator web și designer"
            : "Web developer and designer",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "București",
          addressCountry: "RO",
        },
        areaServed: {
          "@type": "Country",
          name: "Romania",
        },
        sameAs: [
          "https://www.instagram.com/alexandru.maftei95/",
          "https://github.com/mafterr11",
          "https://www.linkedin.com/in/maftei-alexandru/",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: ["ro", "en"],
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
