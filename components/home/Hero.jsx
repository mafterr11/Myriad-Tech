import { Link } from "@/i18n/navigation";
import { Button } from "../ui/button";
import { Download, ArrowUpRight, Send } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { fadeIn } from "@/variants";
import { MotionDiv, MotionH1, MotionP } from "@/lib/motion-client";
import { SITE_IMAGE_DEFAULTS } from "@/lib/site-images/constants";

const fallbackImage = {
  src: SITE_IMAGE_DEFAULTS.hero.image_url,
  alt: SITE_IMAGE_DEFAULTS.hero.alt_en,
};

const Hero = ({ image = fallbackImage }) => {
  const t = useTranslations("Hero");

  return (
    <section id="top" className="hero-section bg-grainy">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <MotionDiv
              variants={fadeIn("down", 0.2)}
              initial="hidden"
              animate="show"
              className="section-kicker"
            >
              Alexandru Maftei <span className="text-black/40">/ Myriad Tech</span>
            </MotionDiv>

            <MotionH1
              variants={fadeIn("down", 0.4)}
              initial="hidden"
              animate="show"
              className="hero-title"
            >
              {t("title")}
            </MotionH1>

            <MotionDiv
              variants={fadeIn("down", 0.5)}
              initial="hidden"
              animate="show"
              className="hero-status"
              aria-label={t("subtitle2")}
            >
              <span className="hero-status-dot" aria-hidden="true" />
              <span>{t("subtitle2")}</span>
            </MotionDiv>

            <MotionP
              variants={fadeIn("down", 0.6)}
              initial="hidden"
              animate="show"
              className="hero-description mt-5"
            >
              {t("subtitle")}
              <strong>{t("subtitle2")}</strong>
              {t("subtitle3")}
            </MotionP>

            <div className="hero-actions">
              <MotionDiv
                variants={fadeIn("right", 0.8)}
                initial="hidden"
                animate="show"
              >
                <Button asChild className="group w-full sm:w-auto">
                  <Link href="/contact">
                    {t("contact-button")}
                    <Send
                      size={17}
                      aria-hidden="true"
                      className="ml-2 transition-transform duration-300 group-hover:rotate-[20deg]"
                    />
                  </Link>
                </Button>
              </MotionDiv>
              <MotionDiv
                variants={fadeIn("left", 0.8)}
                initial="hidden"
                animate="show"
              >
                <Button asChild variant="secondary" className="group w-full sm:w-auto">
                  <a href="/CV.pdf" target="_blank" rel="noopener noreferrer" download>
                    {t("download-button")}
                    <Download
                      size={17}
                      aria-hidden="true"
                      className="ml-2 transition-transform duration-300 group-hover:-translate-y-0.5"
                    />
                  </a>
                </Button>
              </MotionDiv>
            </div>

            <MotionDiv
              variants={fadeIn("up", 1)}
              initial="hidden"
              animate="show"
              className="hero-proof"
              aria-label="Services"
            >
              <span>Web Development</span>
              <span>Web Design</span>
              <span>SEO</span>
            </MotionDiv>
          </div>

          <MotionDiv
            variants={fadeIn("left", 0.4)}
            initial="hidden"
            animate="show"
            className="hero-visual"
          >
            <div className="hero-frame">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="(max-width: 767px) 88vw, (max-width: 1199px) 55vw, 31rem"
                className="object-cover"
              />
            </div>
            <div className="hero-caption">
              <span>{t("subtitle2")}</span>
              <span className="inline-flex items-center gap-1">
                01 <ArrowUpRight size={14} aria-hidden="true" />
              </span>
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
};

export default Hero;
