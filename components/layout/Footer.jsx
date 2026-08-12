import Link from "next/link";
import { useTranslations } from "next-intl";
import Socials from "../Socials";

const currentYear = new Date().getFullYear();

const Footer = () => {
  const t = useTranslations("Footer");

  return (
    <footer className="relative overflow-hidden border-t border-black/10 bg-accent text-body">
      <div className="pointer-events-none absolute -top-44 -right-24 h-96 w-96 rounded-full border border-body/10" />
      <div className="pointer-events-none absolute -top-28 -right-4 h-64 w-64 rounded-full border border-teal/35" />

      <div className="container relative pt-14 pb-7 sm:pt-16 lg:pt-20">
        <div className="grid gap-12 border-b border-body/20 pb-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)] lg:items-end lg:gap-20 lg:pb-14">
          <div>
            <span className="inline-flex items-center gap-3 font-recursive text-[0.7rem] font-bold tracking-[0.22em] text-body/60 uppercase before:h-px before:w-10 before:bg-teal before:content-['']">
              {t("kicker")}
            </span>
            <p className="mt-5 font-recursive text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.82] font-semibold tracking-[-0.085em] text-body">
              Myriad <span className="text-teal">Tech</span>
            </p>
            <p className="mt-7 max-w-xl text-base leading-7 text-body/70 sm:text-lg">
              {t("description")}
            </p>
          </div>

          <section aria-labelledby="footer-contact-title" className="lg:pb-1">
            <h2
              id="footer-contact-title"
              className="font-recursive text-[0.7rem] font-bold tracking-[0.2em] text-body/55 uppercase"
            >
              {t("directContact")}
            </h2>
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-body/45 uppercase">{t("email")}</p>
                <a
                  href="mailto:alexandrumaftei95@gmail.com"
                  className="focus-ring mt-1 inline-block break-all font-recursive text-lg font-semibold text-body underline decoration-teal/50 underline-offset-4 transition-colors hover:text-white sm:text-xl"
                >
                  alexandrumaftei95@gmail.com
                </a>
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-body/45 uppercase">{t("phone")}</p>
                <a
                  href="tel:+40720425840"
                  className="focus-ring mt-1 inline-block font-recursive text-lg font-semibold text-body underline decoration-teal/50 underline-offset-4 transition-colors hover:text-white sm:text-xl"
                >
                  +40 720 425 840
                </a>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.45fr)_minmax(18rem,0.55fr)] lg:gap-14">
          <section aria-labelledby="footer-consumer-title">
            <h2
              id="footer-consumer-title"
              className="font-recursive text-[0.68rem] font-bold tracking-[0.2em] text-body/55 uppercase"
            >
              {t("consumer")}
            </h2>
            <div className="mt-4 grid max-w-[30rem] gap-3 sm:grid-cols-2">
              <a
                href="https://anpc.ro/ce-este-sal/"
                target="_blank"
                rel="nofollow noopener noreferrer"
                aria-label="ANPC - Soluționarea Alternativă a Litigiilor"
                className="focus-ring flex min-h-16 items-center justify-center border border-body/25 bg-body px-3 py-2 shadow-[4px_4px_0_rgba(27,26,23,0.16)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(92,133,135,0.5)] motion-reduce:transform-none motion-reduce:transition-none"
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
                className="focus-ring flex min-h-16 items-center justify-center border border-body/25 bg-body px-3 py-2 shadow-[4px_4px_0_rgba(27,26,23,0.16)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(92,133,135,0.5)] motion-reduce:transform-none motion-reduce:transition-none"
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

          <section aria-labelledby="footer-social-title">
            <h2
              id="footer-social-title"
              className="font-recursive text-[0.68rem] font-bold tracking-[0.2em] text-body/55 uppercase"
            >
              {t("connect")}
            </h2>
            <Socials
              className="mt-4 gap-2 text-xl"
              linkClassName="flex h-11 w-11 items-center justify-center border border-body/25 bg-body/[0.06] text-body hover:scale-100 hover:border-teal hover:bg-teal hover:text-white"
            />
          </section>

          <section aria-labelledby="footer-legal-title">
            <h2
              id="footer-legal-title"
              className="font-recursive text-[0.68rem] font-bold tracking-[0.2em] text-body/55 uppercase"
            >
              {t("legal")}
            </h2>
            <nav className="mt-4 flex flex-col items-start gap-3 text-sm">
              <Link
                href={t("gdpr")}
                className="focus-ring text-body/70 underline decoration-body/30 underline-offset-4 transition-colors hover:text-white"
              >
                {t("name")}
              </Link>
              <Link
                href={t("cookies")}
                className="focus-ring text-body/70 underline decoration-body/30 underline-offset-4 transition-colors hover:text-white"
              >
                {t("name2")}
              </Link>
            </nav>
          </section>
        </div>

        <div className="flex flex-col gap-2 border-t border-body/20 pt-6 text-sm text-body/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Myriad Tech — {t("rights")}</p>
          <p>{t("location")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
