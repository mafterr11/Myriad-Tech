import Link from "@/components/layout/TransitionLink";
import { Button } from "@/components/ui/button";
import WorkSwiper from "./WorkSwiper";
import { useTranslations } from "next-intl";
import { Dot } from "../Dot";
import { fadeIn } from "@/variants";
import { MotionDiv, MotionH2 } from "@/lib/motion-client";

const Work = ({ projects = [], error }) => {
  const t = useTranslations("Work");

  return (
    <section id="work" className="site-section relative max-xl:overflow-x-hidden">
      <div className="container">
        <div className="mb-12 flex flex-col justify-between gap-6 xl:mb-16 xl:flex-row xl:items-end">
          <MotionDiv
            variants={fadeIn("right", 0.4)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <span className="section-kicker">Selected work</span>
            <MotionH2 className="section-title mt-4">
              <Dot />
              {t("title")}
            </MotionH2>
          </MotionDiv>
          <div className="flex max-w-xl flex-col items-start gap-5 xl:items-end xl:text-right">
            <p className="section-copy">{t("subtitle")}</p>
            <Button asChild variant="secondary" className="group">
              <Link href="/projects">
                {t("projects-button")}
                <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="border border-line bg-white/50 px-6 py-12 text-center text-black/60">
            {error ? t("error") : t("empty")}
          </div>
        ) : (
          <MotionDiv
            variants={fadeIn("left", 0.4)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="-mx-5 sm:-mx-7 xl:mx-0"
          >
            <WorkSwiper projects={projects} />
          </MotionDiv>
        )}
      </div>
    </section>
  );
};

export default Work;
