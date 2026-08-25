import { Link } from "@/i18n/navigation";
import { Button } from "../ui/button";
import { Download, ArrowUpRight, Send } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { SITE_IMAGE_DEFAULTS } from "@/lib/site-images/constants";

const fallbackImage = {
  src: SITE_IMAGE_DEFAULTS.hero.image_url,
  alt: SITE_IMAGE_DEFAULTS.hero.alt_en,
};

// Nothing above the fold animates in. The heading and the portrait are the LCP
// candidates, and a fade from `opacity: 0` kept them invisible until hydration
// finished, which pushed LCP out by more than a second. Every section further
// down the page still animates on scroll.
const Hero = ({ image = fallbackImage }) => {
  const t = useTranslations("Hero");

  return (
    <section id="top" className="hero-section bg-grainy">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            {/* One line on every width. The two halves are their own spans so
                the rule, the name and the brand can never be broken apart by
                a wrap — on a 390px phone the default kicker size split this
                into four lines. */}
            <div className="section-kicker hero-kicker">
              <span>Alexandru Maftei</span>
              <span className="text-black/40">/ Myriad Tech</span>
            </div>

            <h1 className="hero-title">{t("title")}</h1>

            <div className="hero-status">
              <span className="hero-status-dot" aria-hidden="true" />
              <span>{t("status")}</span>
            </div>

            {/* The full paragraph pushed the buttons below the fold on a
                phone, but dropping it entirely left the title sitting on the
                status pill with nothing to explain it. Mobile gets a single
                short line instead; desktop keeps the long one. */}
            <p className="hero-description mt-5 max-md:hidden">
              {t("description")}
            </p>
            <p className="hero-description hero-description-short mt-4 md:hidden">
              {t("description-short")}
            </p>

            <div className="hero-actions">
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
              <Button
                asChild
                variant="secondary"
                className="group w-full sm:w-auto max-md:min-h-11 max-md:py-2.5"
              >
                <a
                  href="/CV.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  {t("download-button")}
                  <Download
                    size={17}
                    aria-hidden="true"
                    className="ml-2 transition-transform duration-300 group-hover:-translate-y-0.5"
                  />
                </a>
              </Button>
            </div>

            <div className="hero-proof" aria-label="Services">
              <span>Web Development</span>
              <span>Web Design</span>
              <span>SEO</span>
            </div>
          </div>

          <div className="hero-visual">
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
              <span>{t("caption")}</span>
              <span className="inline-flex items-center gap-1">
                01 <ArrowUpRight size={14} aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
