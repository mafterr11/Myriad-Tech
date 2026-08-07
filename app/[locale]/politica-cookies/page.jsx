import { constructMetadata } from "@/lib/utils";
import { useTranslations } from "next-intl";

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

const PoliticaCookies = () => {
  const t = useTranslations("Cookies");
  return (
    <div className="container mx-auto py-[12rem]">
      <h1 className="text-4xl tracking-wide mb-32 text-center font-normal text-accent">
        {t("name")}
      </h1>
      <p className="my-4 text-sm">
        <span className="text-accent">-</span> {t("1")}
      </p>
      <p className="my-4 text-sm">
        <span className="text-accent">-</span> {t("2")}
      </p>
      <p className="my-4 text-sm">
        <span className="text-accent">-</span> {t("3")}
      </p>
      <p className="my-4 text-sm">
        <span className="text-accent">-</span> {t("4")}
      </p>
      <p className="my-4 text-sm">
        <span className="text-accent">-</span> {t("5")}
      </p>

      <p className=" leading-normal mb-2">{t("6")}</p>
      <p className="mb-6 text-sm">{t("7")}</p>

      <p className="my-4 text-sm">
        <span className="text-accent">-</span> {t("8")}
      </p>
      <p className="my-4 text-sm">
        <span className="text-accent">-</span> {t("9")}
      </p>
    </div>
  );
};

export default PoliticaCookies;
