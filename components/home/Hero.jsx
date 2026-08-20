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
            <div className="section-kicker">
              Alexandru Maftei{" "}
              <span className="text-black/40">/ Myriad Tech</span>
            </div>

            <h1 className="hero-title">{t("title")}</h1>

            <div className="hero-status">
              <span className="hero-status-dot" aria-hidden="true" />
              <span>{t("status")}</span>
            </div>

            {/* The paragraph repeats what the title, the status pill and the
                proof row already say, and on a phone it pushed the buttons
                below the fold. Desktop keeps it. */}
            <p className="hero-description mt-5 max-md:hidden">
              {t("description")}
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
                className="group w-full sm:w-auto"
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
