import { MailIcon, PhoneCall, MoveRight } from "lucide-react";
import ContactForm from "./ContactForm";
import { useTranslations } from "next-intl";
import { RiWhatsappLine } from "react-icons/ri";
import { fadeIn } from "@/variants";
import GoogleCaptchaWrapper from "../../GoogleCaptchaWrapper";
import { MotionDiv, MotionH1, MotionP } from "@/lib/motion-client";
import Faq from "./Faq";

const ContactPage = () => {
  const t = useTranslations("Contact");

  return (
    <div className="min-h-screen pb-24 pt-32 sm:pt-40">
      <div className="container">
        <div className="grid items-center gap-10 border-b border-line pb-14 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.78fr)] xl:gap-20 xl:pb-20">
          <div>
            <MotionDiv
              variants={fadeIn("down", 0.2)}
              initial="hidden"
              animate="show"
              className="section-kicker"
            >
              {t("subtitle2")}
            </MotionDiv>
            <MotionH1
              variants={fadeIn("right", 0.2)}
              initial="hidden"
              animate="show"
              className="mt-5 max-w-4xl"
            >
              {t("title")}
            </MotionH1>
            <MotionP
              variants={fadeIn("up", 0.2)}
              initial="hidden"
              animate="show"
              className="section-copy mt-6 max-w-2xl"
            >
              {t("subtitle")}
            </MotionP>
          </div>
          <MotionDiv
            variants={fadeIn("left", 0.2)}
            initial="hidden"
            animate="show"
            className="bg-contact min-h-[16rem] w-full bg-contain bg-center bg-no-repeat opacity-85 sm:min-h-[22rem]"
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
                  <PhoneCall size={21} className="text-accent" aria-hidden="true" />
                  <a
                    href="tel:+40720425840"
                    className="focus-ring hover:text-accent"
                  >
                    +40.720.425.840
                  </a>
                </MotionDiv>
                <div className="text-xs font-bold tracking-[0.18em] text-black/40 uppercase">{t("or")}</div>
                <MotionDiv
                  variants={fadeIn("down", 0.3)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  className="flex items-center gap-x-4"
                >
                  <RiWhatsappLine size={23} className="text-accent" aria-hidden="true" />
                  <a
                    href="http://wa.me/+40720425840"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring hover:text-accent"
                  >
                    {t("whatsapp")}
                  </a>
                </MotionDiv>
                <div className="text-xs font-bold tracking-[0.18em] text-black/40 uppercase">{t("or")}</div>
                <MotionDiv
                  variants={fadeIn("down", 0.4)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  className="flex items-center gap-x-4"
                >
                  <MailIcon size={21} className="text-accent" aria-hidden="true" />
                  <a
                    href="mailto:alexandrumaftei95@gmail.com"
                    className="focus-ring hover:text-accent"
                  >
                    alexandrumaftei95@gmail.com
                  </a>
                  <MoveRight size={25} strokeWidth={1.2} className="ml-auto hidden text-accent sm:block" aria-hidden="true" />
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
            <div className="mb-8 flex items-end justify-between gap-4 border-b border-line pb-5">
              <div>
                <span className="section-kicker">Start a conversation</span>
                <p className="mt-3 text-sm text-black/60">{t("subtitle2")}</p>
              </div>
              <span className="font-recursive text-xs font-bold tracking-[0.16em] text-black/40">FORM / 01</span>
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
