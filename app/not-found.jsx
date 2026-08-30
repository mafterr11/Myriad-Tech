import Link from "next/link";
import { NextIntlClientProvider, createTranslator } from "next-intl";
import { routing } from "@/i18n/routing";
import messages from "@/messages/ro.json";
import { constructMetadata } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { recursive, roboto } from "@/lib/fonts";
import "./[locale]/globals.css";

export const metadata = constructMetadata({ noIndex: true });

// A 404 raised above the `[locale]` segment has no locale to read, so this page
// renders the default one and supplies its own <html> shell, fonts and chrome
// rather than dropping the visitor onto a bare error string. The messages are
// imported rather than fetched through `getMessages`, which would tie the page
// to the incoming request and force every route around it to render on demand.
export default function NotFound() {
  const locale = routing.defaultLocale;
  const t = createTranslator({ locale, messages, namespace: "NotFound" });

  const links = [
    { href: `/${locale}`, label: t("home"), primary: true },
    { href: `/${locale}/proiecte`, label: t("projects") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  return (
    <html lang={locale}>
      <body
        className={`${roboto.variable} ${recursive.variable} overflow-x-hidden`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="bg-grainy flex min-h-svh items-center py-40">
            <div className="container">
              <span className="section-kicker">{t("code")}</span>
              <h1 className="hero-title mt-4 max-w-3xl">{t("title")}</h1>
              <p className="section-copy mt-6 max-w-xl">{t("description")}</p>
              <ul className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`focus-ring inline-flex items-center gap-2 underline-offset-4 hover:underline ${
                        link.primary
                          ? "text-accent text-lg font-bold"
                          : "text-black/70"
                      }`}
                    >
                      {link.label}
                      <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
