import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link as LocaleLink } from "@/i18n/navigation";
import Socials from "../Socials";

const currentYear = new Date().getFullYear();

const Footer = () => {
  const t = useTranslations("Footer");

  return (
    <footer className="relative overflow-hidden border-t border-accent bg-black-heavy text-white">
      <div className="pointer-events-none absolute -top-28 -right-20 h-72 w-72 rounded-full border border-white/8" />
      <div className="pointer-events-none absolute -top-14 -right-6 h-44 w-44 rounded-full border border-teal/25" />

      <div className="container relative py-14 sm:py-16 lg:py-20">
        <div className="grid gap-9 border-b border-white/15 pb-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16 lg:pb-14">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-3 font-recursive text-[0.7rem] font-bold tracking-[0.22em] text-teal uppercase before:h-px before:w-10 before:bg-current before:content-['']">
              Myriad Tech / {t("kicker")}
            </span>
            <h2 className="mt-5 max-w-[18ch] font-recursive text-[clamp(2.25rem,5vw,4.75rem)] leading-[0.98] font-semibold tracking-[-0.065em] text-white">
              {t("headline")}
            </h2>
          </div>

          <LocaleLink
            href="/contact"
            className="focus-ring group inline-flex min-h-12 w-fit items-center justify-center gap-3 border border-teal bg-teal px-5 py-3 font-recursive text-sm font-bold tracking-[0.04em] text-white transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-transparent motion-reduce:transform-none motion-reduce:transition-none"
          >
            {t("contact")}
            <ArrowUpRight
              size={18}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
            />
          </LocaleLink>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)] lg:gap-20 lg:py-12">
          <section aria-labelledby="footer-consumer-title">
            <h3
              id="footer-consumer-title"
              className="font-recursive text-[0.68rem] font-bold tracking-[0.2em] text-white/55 uppercase"
            >
              {t("consumer")}
            </h3>
            <div className="mt-4 grid max-w-[34rem] gap-3 sm:grid-cols-2">
              <a
                href="https://anpc.ro/ce-este-sal/"
                target="_blank"
                rel="nofollow noopener noreferrer"
                aria-label="ANPC - Soluționarea Alternativă a Litigiilor"
                className="focus-ring flex min-h-20 items-center justify-center border border-white/15 bg-white px-3 py-2 shadow-[5px_5px_0_rgba(92,133,135,0.22)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-teal hover:shadow-[7px_7px_0_rgba(92,133,135,0.28)] motion-reduce:transform-none motion-reduce:transition-none"
              >
                <img
                  className="h-auto w-full max-w-[14rem]"
                  src="https://wpfitness.eu/wp-content/uploads/2022/10/anpc-sal.png"
                  alt="Soluționarea Alternativă a Litigiilor"
                  loading="lazy"
                />
              </a>
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="nofollow noopener noreferrer"
                aria-label="ANPC - Soluționarea Online a Litigiilor"
                className="focus-ring flex min-h-20 items-center justify-center border border-white/15 bg-white px-3 py-2 shadow-[5px_5px_0_rgba(92,133,135,0.22)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-teal hover:shadow-[7px_7px_0_rgba(92,133,135,0.28)] motion-reduce:transform-none motion-reduce:transition-none"
              >
                <img
                  className="h-auto w-full max-w-[14rem]"
                  src="https://wpfitness.eu/wp-content/uploads/2022/10/anpc-sol.png"
                  alt="Soluționarea Online a Litigiilor"
                  loading="lazy"
                />
              </a>
            </div>
          </section>

          <section aria-labelledby="footer-connect-title" className="lg:justify-self-end">
            <h3
              id="footer-connect-title"
              className="font-recursive text-[0.68rem] font-bold tracking-[0.2em] text-white/55 uppercase"
            >
              {t("connect")}
            </h3>
            <Socials
              className="mt-4 gap-2 text-xl"
              linkClassName="flex h-11 w-11 items-center justify-center border border-white/20 bg-white/[0.04] text-white hover:scale-100 hover:border-teal hover:bg-teal hover:text-white"
            />
          </section>
        </div>

        <div className="flex flex-col gap-5 border-t border-white/15 pt-7 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <p>
            <span className="font-semibold text-white">Myriad Tech</span> © {currentYear} — {t("rights")}
          </p>
          <nav aria-label={t("legal")} className="flex flex-wrap gap-x-6 gap-y-3">
            <Link
              href={t("gdpr")}
              className="focus-ring underline decoration-white/25 underline-offset-4 transition-colors hover:text-white"
            >
              {t("name")}
            </Link>
            <Link
              href={t("cookies")}
              className="focus-ring underline decoration-white/25 underline-offset-4 transition-colors hover:text-white"
            >
              {t("name2")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
