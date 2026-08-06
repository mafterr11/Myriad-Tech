import { constructMetadata } from "@/lib/utils";
import { useTranslations } from "next-intl";

export const metadata = constructMetadata({
  title: "Politica de confidentialitate - Myriad Tech",
  description: "Aceasta pagina cuprinde termenii si conditiile de utilizare a site-ului web Myriad Tech.",
})

const PoliticaDeConfidentialitate = () => {
  const t = useTranslations("Terms");
  return (
    <div className="container mx-auto py-[12rem]">
      <h1 className="text-4xl tracking-wide mb-32 text-center font-normal text-accent">
        {t("titlu")}
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

      <p>{t("6")}</p>
      <p className="mb-6 text-sm">{t("7")}</p>

      <p className="my-4 text-sm">
        <span className="text-accent">-</span> {t("8")}
      </p>
      <p className="my-4 text-sm">
        <span className="text-accent">-</span> {t("9")}
      </p>
      <p className="my-4 text-sm">
        <span className="text-accent">-</span> {t("10")}
      </p>
      <p className="my-4 text-sm">
        <span className="text-accent">-</span> {t("11")}
      </p>

      <p className="mb-6 mt-8 text-lg">{t("12")}</p>

      <p className="mb-2 text-sm text-accent">{t("13")}</p>
      <p className="mb-2 text-sm text-accent">{t("14")}</p>
      <p className="mb-2 text-sm text-accent">{t("15")}</p>
      <p className="mb-2 text-sm text-accent">{t("16")}</p>
      <p className="mb-2 text-sm text-accent">{t("17")}</p>
      <p className="mb-2 text-sm text-accent">{t("18")}</p>
      <p className="mb-2 text-sm text-accent">{t("19")}</p>
      <p className="mb-2 text-sm text-accent">{t("20")}</p>
      <p className="mb-8 text-sm text-accent">{t("21")}</p>

      <p>{t("22")}</p>
    </div>
  );
};

export default PoliticaDeConfidentialitate;
