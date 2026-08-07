import { constructMetadata } from "@/lib/utils";
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

export default function Contact() {
  return <ContactPage />;
}
