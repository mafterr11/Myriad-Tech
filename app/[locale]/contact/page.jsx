import Script from "next/script";
import { constructMetadata } from "@/lib/utils";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import ContactPage from "./ContactPage";

const seo = {
  ro: {
    title: "Contact Web Design București | Myriad Tech",
    description:
      "Discută cu Alexandru Maftei despre site-ul, magazinul online sau aplicația web de care afacerea ta are nevoie. Contact Myriad Tech, București.",
  },
  en: {
    title: "Contact a Web Developer in Bucharest | Myriad Tech",
    description:
      "Talk to Alexandru Maftei about the website, online store or web application your business needs. Contact Myriad Tech in Bucharest.",
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const content = locale === "en" ? seo.en : seo.ro;

  return constructMetadata({
    locale,
    route: "contact",
    ...content,
  });
}

export default async function Contact({ params }) {
  const { locale } = await params;
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;

  return (
    <>
      <BreadcrumbJsonLd locale={locale} route="contact" />
      <FaqJsonLd locale={locale} />
      {/* Only this page submits a protected form, so reCAPTCHA no longer costs
          every other page a third-party request. */}
      {siteKey ? (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
          strategy="afterInteractive"
        />
      ) : null}
      <ContactPage />
    </>
  );
}
