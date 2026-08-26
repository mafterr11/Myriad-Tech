import { MailIcon, PhoneCall, MoveRight } from "lucide-react";
import ContactForm from "./ContactForm";
import { useTranslations } from "next-intl";
import { RiWhatsappLine } from "react-icons/ri";
import { fadeIn } from "@/variants";
import GoogleCaptchaWrapper from "../../GoogleCaptchaWrapper";
import { MotionDiv } from "@/lib/motion-client";
import Faq from "./Faq";

const ContactPage = () => {
  const t = useTranslations("Contact");

  return (
    <div className="min-h-screen pt-20 pb-24 sm:pt-40">
      <div className="container">
        <div className="border-line grid items-center gap-10 border-b pb-14 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.78fr)] xl:gap-20 xl:pb-20">
          {/* Nothing in this header animates in. A mount-triggered fade fires
              the moment the route commits -- which is while the curtain is
              still over the page -- so it played to nobody and left the h1, an
              LCP candidate, sitting at opacity 0. The curtain lift is the
              reveal. Every whileInView below still runs on scroll, long after
              the curtain is gone. */}
          <div>
            <div className="section-kicker">{t("subtitle2")}</div>
            <h1 className="mt-5 max-w-4xl">{t("title")}</h1>
            <p className="section-copy mt-6 max-w-2xl max-md:hidden">
              {t("subtitle")}
            </p>
          </div>
          <div
            className="bg-contact hidden w-full bg-contain bg-center bg-no-repeat md:block md:min-h-[22rem]"
            aria-hidden="true"
          />
        </div>

        <div className="grid gap-10 pt-14 xl:grid-cols-[minmax(17rem,0.7fr)_minmax(0,1.3fr)] xl:gap-16 xl:pt-20">
          <div className="flex flex-col">
            <div className="paper-panel p-6 sm:p-8">
              <span className="section-kicker">Direct contact</span>
              <div className="mt-6 flex flex-col gap-5 text-base sm:text-lg">
                <MotionDiv
                  variants={fadeIn("down", 0.2)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  className="flex items-center gap-x-4"
                >
                  <PhoneCall
                    size={21}
                    className="text-accent"
                    aria-hidden="true"
                  />
                  <a
                    href="tel:+40720425840"
                    className="focus-ring hover:text-accent"
                  >
                    +40.720.425.840
                  </a>
                </MotionDiv>
                <div className="text-xs font-bold tracking-[0.18em] text-black/40 uppercase">
                  {t("or")}
                </div>
                <MotionDiv
                  variants={fadeIn("down", 0.3)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  className="flex items-center gap-x-4"
                >
                  <RiWhatsappLine
                    size={23}
                    className="text-accent"
                    aria-hidden="true"
                  />
                  <a
                    href="http://wa.me/+40720425840"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring hover:text-accent"
                  >
                    {t("whatsapp")}
                  </a>
                </MotionDiv>
                <div className="text-xs font-bold tracking-[0.18em] text-black/40 uppercase">
                  {t("or")}
                </div>
                <MotionDiv
                  variants={fadeIn("down", 0.4)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  className="flex items-center gap-x-4"
                >
                  <MailIcon
                    size={21}
                    className="text-accent"
                    aria-hidden="true"
                  />
                  <a
                    href="mailto:alexandrumaftei95@gmail.com"
                    className="focus-ring hover:text-accent"
                  >
                    alexandrumaftei95@gmail.com
                  </a>
                  <MoveRight
                    size={25}
                    strokeWidth={1.2}
                    className="text-accent ml-auto hidden sm:block"
                    aria-hidden="true"
                  />
                </MotionDiv>
              </div>
            </div>
            <Faq />
          </div>

          <MotionDiv
            variants={fadeIn("up", 0.3)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="paper-panel p-6 sm:p-9"
          >
            <div className="border-line mb-8 flex items-end justify-between gap-4 border-b pb-5">
              <div>
                <span className="section-kicker">Start a conversation</span>
                <p className="mt-3 text-sm text-black/60">{t("subtitle2")}</p>
              </div>
              <span className="font-recursive text-xs font-bold tracking-[0.16em] text-black/40">
                FORM / 01
              </span>
            </div>
            <GoogleCaptchaWrapper>
              <ContactForm />
            </GoogleCaptchaWrapper>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
