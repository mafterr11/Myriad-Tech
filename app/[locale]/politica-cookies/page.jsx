import { constructMetadata } from "@/lib/utils";
import { useTranslations } from "next-intl";

export const metadata = constructMetadata({
  title: "Politica de confidentialitate - Myriad Tech",
  description: "Aceasta pagina cuprinde termenii si conditiile de utilizare a site-ului web Myriad Tech.",
})

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
