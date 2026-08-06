import { constructMetadata } from "@/lib/utils";
import ContactPage from "./ContactPage";

export const metadata = constructMetadata({
  title: "Contact Myriad Tech",
  description:
    "Contactați Myriad Tech pentru întrebări, suport și colaborări. Suntem aici să vă ajutăm cu toate nevoile dvs. de web development.",
  keywords:
    "contact Myriad Tech, suport client, dezvoltator web contact, bucuresti, romania, maftei alexandru",
});

export default function Contact() {
  return <ContactPage />;
}
