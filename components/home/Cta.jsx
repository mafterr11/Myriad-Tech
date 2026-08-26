import Link from "@/components/layout/TransitionLink";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { fadeIn } from "@/variants";
import { MotionDiv, MotionH2 } from "@/lib/motion-client";

const Cta = () => {
  const t = useTranslations("Cta");
  const tLink = useTranslations("Hero");

  return (
    <section className="site-section pt-16 pb-28">
      <div className="container">
        <div className="paper-panel relative overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -right-12 -bottom-24 h-64 w-64 rounded-full border border-teal/30" />
          <div className="pointer-events-none absolute -right-4 -bottom-16 h-40 w-40 rounded-full border border-teal/20" />
          <span className="section-kicker justify-center">Myriad Tech / Contact</span>
          <MotionH2
            variants={fadeIn("down", 0.5)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mx-auto mt-5 flex max-w-3xl flex-col items-center gap-4 text-center"
          >
            {t("title")}
            <span className="max-w-2xl font-roboto text-lg font-normal leading-7 tracking-normal text-black/70 sm:text-2xl">
              {t("title2")}
            </span>
          </MotionH2>
          <MotionDiv
            variants={fadeIn("up", 0.6)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-8"
          >
            <Button asChild className="group">
              <Link href="/contact">
                {tLink("contact-button")}
                <Send
                  size={17}
                  aria-hidden="true"
                  className="ml-2 transition-transform duration-300 group-hover:rotate-[20deg]"
                />
              </Link>
            </Button>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
};

export default Cta;
