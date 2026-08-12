import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link as LocaleLink } from "@/i18n/navigation";
import Socials from "../Socials";

const currentYear = new Date().getFullYear();

const Footer = () => {
  const t = useTranslations("Footer");

  return (
    <footer className="relative overflow-hidden border-t border-line bg-grainy">
      <div className="pointer-events-none absolute -right-28 -bottom-40 h-80 w-80 rounded-full border border-teal/15" />
      <div className="pointer-events-none absolute -right-12 -bottom-24 h-52 w-52 rounded-full border border-accent/10" />

      <div className="container relative py-10 sm:py-12 lg:py-14">
        <div className="overflow-hidden border border-line bg-white/60 shadow-[10px_10px_0_rgba(103,72,57,0.08)] backdrop-blur-[2px]">
          <div className="h-1 w-full bg-accent" />

          <div className="grid gap-7 px-6 py-8 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12 lg:px-10">
            <div className="max-w-3xl">
              <span className="section-kicker">Myriad Tech / {t("kicker")}</span>
              <h2 className="mt-4 max-w-[32ch] font-recursive text-2xl leading-[1.15] font-semibold tracking-[-0.035em] text-black sm:text-[2rem]">
                {t("headline")}
              </h2>
            </div>

            <LocaleLink
              href="/contact"
              className="focus-ring group inline-flex min-h-12 w-fit items-center justify-center gap-3 border border-accent bg-accent px-5 py-3 font-recursive text-sm font-bold tracking-[0.04em] text-white shadow-[4px_4px_0_rgba(103,72,57,0.18)] transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-teal hover:bg-teal hover:shadow-[6px_6px_0_rgba(92,133,135,0.2)] motion-reduce:transform-none motion-reduce:transition-none"
            >
              {t("contact")}
              <ArrowUpRight
                size={18}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
              />
            </LocaleLink>
          </div>

          <div className="grid border-t border-line lg:grid-cols-[minmax(0,1fr)_22rem]">
            <section
              aria-labelledby="footer-consumer-title"
              className="border-b border-line px-6 py-7 sm:px-8 lg:border-r lg:border-b-0 lg:px-10"
            >
              <h3
                id="footer-consumer-title"
                className="font-recursive text-[0.68rem] font-bold tracking-[0.2em] text-accent uppercase"
              >
                {t("consumer")}
              </h3>
              <div className="mt-4 grid max-w-[29rem] gap-3 sm:grid-cols-2">
                <a
                  href="https://anpc.ro/ce-este-sal/"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  aria-label="ANPC - Soluționarea Alternativă a Litigiilor"
                  className="focus-ring flex min-h-16 items-center justify-center border border-line bg-white px-3 py-2 shadow-[3px_3px_0_rgba(103,72,57,0.09)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-teal hover:shadow-[5px_5px_0_rgba(92,133,135,0.16)] motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <img
                    className="h-auto w-full max-w-[12.5rem]"
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
                  className="focus-ring flex min-h-16 items-center justify-center border border-line bg-white px-3 py-2 shadow-[3px_3px_0_rgba(103,72,57,0.09)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-teal hover:shadow-[5px_5px_0_rgba(92,133,135,0.16)] motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <img
                    className="h-auto w-full max-w-[12.5rem]"
                    src="https://wpfitness.eu/wp-content/uploads/2022/10/anpc-sol.png"
                    alt="Soluționarea Online a Litigiilor"
                    loading="lazy"
                  />
                </a>
              </div>
            </section>

            <section
              aria-labelledby="footer-connect-title"
              className="flex flex-col justify-between gap-6 px-6 py-7 sm:px-8"
            >
              <div>
                <h3
                  id="footer-connect-title"
                  className="font-recursive text-[0.68rem] font-bold tracking-[0.2em] text-accent uppercase"
                >
                  {t("connect")}
                </h3>
                <Socials
                  className="mt-4 gap-2 text-lg"
                  linkClassName="flex h-10 w-10 items-center justify-center border border-line bg-white/70 text-black hover:scale-100 hover:border-teal hover:bg-teal hover:text-white"
                />
              </div>

              <nav aria-label={t("legal")} className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link
                  href={t("gdpr")}
                  className="focus-ring text-black/60 underline decoration-accent/35 underline-offset-4 transition-colors hover:text-accent"
                >
                  {t("name")}
                </Link>
                <Link
                  href={t("cookies")}
                  className="focus-ring text-black/60 underline decoration-accent/35 underline-offset-4 transition-colors hover:text-accent"
                >
                  {t("name2")}
                </Link>
              </nav>
            </section>
          </div>

          <div className="border-t border-line bg-body-light/45 px-6 py-4 text-sm text-black/55 sm:px-8 lg:px-10">
            <p>
              <span className="font-semibold text-accent">Myriad Tech</span> © {currentYear} — {t("rights")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
