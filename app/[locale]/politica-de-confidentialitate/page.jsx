import { constructMetadata } from "@/lib/utils";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LegalPage from "@/components/layout/LegalPage";

const seo = {
  ro: {
    title: "Politica de confidențialitate | Myriad Tech",
    description:
      "Află cum Myriad Tech colectează, folosește și protejează datele personale atunci când utilizezi acest site.",
  },
  en: {
    title: "Privacy Policy | Myriad Tech",
    description:
      "Learn how Myriad Tech collects, uses and protects personal information when you use this website.",
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const content = locale === "en" ? seo.en : seo.ro;

  return constructMetadata({
    locale,
    route: "privacy",
    ...content,
  });
}

const PoliticaDeConfidentialitate = async ({ params }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Terms");
  const range = (from, to) =>
    Array.from({ length: to - from + 1 }, (_, index) => t(String(from + index)));

  return (
    <LegalPage
      title={t("titlu")}
      intro={t("intro")}
      sections={[
        {
          id: "scope",
          title: t("sections.scope"),
          paragraphs: range(1, 5),
        },
        {
          id: "purpose",
          title: t("sections.purpose"),
          paragraphs: range(6, 7),
        },
        {
          id: "data",
          title: t("sections.data"),
          paragraphs: range(8, 11),
        },
        {
          id: "rights",
          title: t("sections.rights"),
          paragraphs: [t("12")],
          // 13 to 21 are the nine GDPR rights, already numbered in the copy.
          list: range(13, 21),
        },
        {
          id: "updates",
          title: t("sections.updates"),
          paragraphs: [t("22")],
        },
      ]}
    />
  );
};

export default PoliticaDeConfidentialitate;
