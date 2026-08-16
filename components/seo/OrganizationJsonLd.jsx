import { SITE_NAME, SITE_URL } from "@/lib/utils";
import JsonLd from "./JsonLd";

const PHONE = "+40720425840";
const EMAIL = "alexandrumaftei95@gmail.com";

const copy = {
  ro: {
    description:
      "Servicii de web design, dezvoltare web și optimizare SEO pentru afaceri din București și din România.",
    jobTitle: "Dezvoltator web și designer",
    catalogName: "Servicii web",
    services: [
      {
        name: "Creare site de prezentare",
        description:
          "Site-uri de prezentare rapide, responsive și optimizate SEO, construite cu Next.js sau WordPress.",
      },
      {
        name: "Magazin online",
        description:
          "Magazine online cu plăți, gestiune de produse și o experiență de cumpărare optimizată pentru conversii.",
      },
      {
        name: "Aplicații web personalizate",
        description:
          "Aplicații web pe măsură, cu autentificare, panouri de administrare și integrări prin API.",
      },
      {
        name: "Optimizare SEO tehnică",
        description:
          "Optimizarea vitezei, a structurii site-ului, a metadatelor și a datelor structurate pentru trafic organic.",
      },
    ],
  },
  en: {
    description:
      "Web design, web development and SEO services for businesses in Bucharest, Romania and beyond.",
    jobTitle: "Web developer and designer",
    catalogName: "Web services",
    services: [
      {
        name: "Business website",
        description:
          "Fast, responsive and SEO-ready business websites built with Next.js or WordPress.",
      },
      {
        name: "Online store",
        description:
          "E-commerce stores with payments, product management and a checkout tuned for conversions.",
      },
      {
        name: "Custom web applications",
        description:
          "Tailored web applications with authentication, admin panels and API integrations.",
      },
      {
        name: "Technical SEO",
        description:
          "Speed, site structure, metadata and structured data work that grows organic traffic.",
      },
    ],
  },
};

// Mirrors the testimonials rendered by components/home/Reviews.jsx. Structured
// data must only ever describe what the page actually shows.
const reviews = [
  { author: "Madiny", rating: 5, url: "https://madinytattoo.ro" },
  { author: "Mihai", rating: 5, url: "https://tngag.ro" },
  { author: "Monte Bianco", rating: 4.5, url: "https://montebianco.ro" },
  { author: "Mihaela", rating: 5, url: "https://mbody.vercel.app" },
  { author: "Diana", rating: 4.5, url: "https://dianazu.vercel.app" },
];

const ratingValue =
  Math.round(
    (reviews.reduce((total, review) => total + review.rating, 0) /
      reviews.length) *
      10,
  ) / 10;

export default function OrganizationJsonLd({ locale }) {
  const isRomanian = locale !== "en";
  const text = isRomanian ? copy.ro : copy.en;
  const organizationId = `${SITE_URL}/#organization`;
  const personId = `${SITE_URL}/#alexandru-maftei`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        // ProfessionalService is a LocalBusiness, so the same node covers both
        // the brand entity and the local-search signals.
        "@type": ["ProfessionalService", "Organization"],
        "@id": organizationId,
        name: SITE_NAME,
        alternateName: "Myriad Tech Web Design",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/#logo`,
          url: `${SITE_URL}/Myriad%20Tech%20logo.png`,
          caption: SITE_NAME,
        },
        image: `${SITE_URL}/opengraph-image`,
        description: text.description,
        email: EMAIL,
        telephone: PHONE,
        knowsLanguage: ["ro", "en"],
        founder: {
          "@type": "Person",
          "@id": personId,
          name: "Alexandru Maftei",
          jobTitle: text.jobTitle,
          url: SITE_URL,
          knowsAbout: [
            "Web design",
            "Next.js",
            "React",
            "WordPress",
            "E-commerce",
            "SEO",
          ],
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "București",
          addressRegion: "București",
          addressCountry: "RO",
        },
        areaServed: [
          { "@type": "City", name: "București" },
          { "@type": "Country", name: "Romania" },
        ],
        serviceType: [
          "Web design",
          "Web development",
          "E-commerce development",
          "Search engine optimization",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: text.catalogName,
          itemListElement: text.services.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.name,
              description: service.description,
              provider: { "@id": organizationId },
              areaServed: { "@type": "Country", name: "Romania" },
            },
          })),
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue,
          bestRating: 5,
          reviewCount: reviews.length,
        },
        review: reviews.map((review) => ({
          "@type": "Review",
          author: { "@type": "Person", name: review.author },
          itemReviewed: { "@id": organizationId },
          reviewRating: {
            "@type": "Rating",
            ratingValue: review.rating,
            bestRating: 5,
          },
        })),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          email: EMAIL,
          telephone: PHONE,
          availableLanguage: ["ro", "en"],
          areaServed: "RO",
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
        description: text.description,
        inLanguage: ["ro", "en"],
        publisher: { "@id": organizationId },
      },
    ],
  };

  return <JsonLd data={structuredData} />;
}
