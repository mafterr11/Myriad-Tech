import { useTranslations } from "next-intl";
import { Link as LocaleLink } from "@/i18n/navigation";
import Socials from "../Socials";
import Logo from "./Logo";

const currentYear = new Date().getFullYear();

const Footer = () => {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");

  const exploreLinks = [
    { href: "/", label: tNav("home.name") },
    { href: "/projects", label: tNav("projects.name") },
    { href: "/contact", label: tNav("contact.name") },
  ];

  return (
    <footer className="footer-plate border-t border-line">
      <div className="container pt-16 pb-14 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)] lg:gap-20">
          <div>
            <Logo
              source={"/Myriad Tech header logo.png"}
              size={"h-8 sm:h-9"}
              priority={false}
            />

            <p className="mt-7">
              <span className="section-kicker">{t("kicker")}</span>
            </p>

            <p className="mt-4 max-w-[34rem] text-base leading-8 text-black/70">
              {t("description")}
            </p>

            <div className="mt-9">
              <h2 className="footer-heading">{t("connect")}</h2>
              <Socials
                className="mt-4 gap-3 text-xl"
                baseLinkStyles=""
                linkClassName="footer-social"
              />
            </div>
          </div>

          <section
            aria-labelledby="footer-contact-title"
            className="paper-panel h-fit p-6 sm:p-8"
          >
            <h2 id="footer-contact-title" className="footer-heading">
              {t("directContact")}
            </h2>

            <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <dt className="footer-label">{t("email")}</dt>
                <dd className="mt-2">
                  <a
                    href="mailto:alexandrumaftei95@gmail.com"
                    className="focus-ring footer-contact-link inline-block break-all text-lg"
                  >
                    alexandrumaftei95@gmail.com
                  </a>
                </dd>
              </div>

              <div>
                <dt className="footer-label">{t("phone")}</dt>
                <dd className="mt-2">
                  <a
                    href="tel:+40720425840"
                    className="focus-ring footer-contact-link inline-block text-lg"
                  >
                    +40 720 425 840
                  </a>
                </dd>
              </div>
            </dl>

            <p className="mt-7 flex items-center gap-2.5 border-t border-line pt-5 text-sm text-black/55">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-teal"
              />
              {t("location")}
            </p>
          </section>
        </div>

        <nav
          aria-labelledby="footer-explore-title"
          className="mt-14 border-t border-line pt-10"
        >
          <h2 id="footer-explore-title" className="footer-heading">
            {t("explore")}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-[0.95rem]">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <LocaleLink
                  href={link.href}
                  className="focus-ring footer-link block"
                >
                  {link.label}
                </LocaleLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="footer-baseline">
        <div className="container flex flex-col gap-3 py-5 text-[0.8rem] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body/60">
            © {currentYear} Myriad Tech — {t("rights")}
          </p>
          <nav
            aria-label={t("legal")}
            className="flex flex-wrap items-center gap-x-6 gap-y-2"
          >
            <LocaleLink
              href="/politica-de-confidentialitate"
              className="focus-ring text-body/60 underline decoration-body/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white/60"
            >
              {t("name")}
            </LocaleLink>
            <LocaleLink
              href="/politica-cookies"
              className="focus-ring text-body/60 underline decoration-body/25 underline-offset-4 transition-colors hover:text-white hover:decoration-white/60"
            >
              {t("name2")}
            </LocaleLink>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
