import { getTranslations } from "next-intl/server";
import { getLocalizedUrls } from "@/lib/utils";
import JsonLd from "./JsonLd";

const QUESTION_KEYS = ["1", "2", "3", "4"];

// The questions and answers are read from the same messages the accordion
// renders, so the markup can never describe content that is not on the page.
export default async function FaqJsonLd({ locale }) {
  const t = await getTranslations({ locale, namespace: "Contact" });
  const url = getLocalizedUrls("contact")[locale === "en" ? "en" : "ro"];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: QUESTION_KEYS.map((key) => ({
      "@type": "Question",
      name: t(`faq.q${key}`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`faq.a${key}`),
      },
    })),
  };

  return <JsonLd data={structuredData} />;
}
