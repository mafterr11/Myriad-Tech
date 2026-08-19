import { constructMetadata } from "@/lib/utils";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LegalPage from "@/components/layout/LegalPage";

const seo = {
  ro: {
    title: "Politica privind cookie-urile | Myriad Tech",
    description:
      "Află ce cookie-uri folosește site-ul Myriad Tech, de ce sunt utilizate și cum îți poți gestiona preferințele.",
  },
  en: {
    title: "Cookie Policy | Myriad Tech",
    description:
      "Learn which cookies the Myriad Tech website uses, why they are used and how you can manage your preferences.",
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const content = locale === "en" ? seo.en : seo.ro;

  return constructMetadata({
    locale,
    route: "cookies",
    ...content,
  });
}

const PoliticaCookies = async ({ params }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Cookies");
  const range = (from, to) =>
    Array.from({ length: to - from + 1 }, (_, index) => t(String(from + index)));

  return (
    <LegalPage
      title={t("name")}
      intro={t("intro")}
      sections={[
        { id: "what", title: t("sections.what"), paragraphs: range(1, 2) },
        { id: "control", title: t("sections.control"), paragraphs: range(3, 4) },
        { id: "usage", title: t("sections.usage"), paragraphs: range(5, 6) },
        {
          id: "security",
          title: t("sections.security"),
          paragraphs: range(7, 9),
        },
      ]}
    />
  );
};

export default PoliticaCookies;
