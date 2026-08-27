import { Roboto, Recursive } from "next/font/google";
import { notFound } from "next/navigation";
import "./globals.css";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import SkipLink from "../../components/layout/SkipLink";
import { Toaster } from "@/components/ui/toaster";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { Analytics } from "@vercel/analytics/react";
import { constructMetadata } from "@/lib/utils";
import { Suspense } from "react";
import GoogleAnalytics from "@/components/google-analytics";
import CookieBanner from "@/components/cookie-banner";
import { getMessages, setRequestLocale } from "next-intl/server";
import LenisScroll from "./LenisScroll";
import IntroOverlay from "../../components/layout/IntroOverlay";
import CurtainProvider from "../../components/layout/CurtainProvider";
import LanguageSwapOverlay from "../../components/layout/LanguageSwapOverlay";
import { routing } from "@/i18n/routing";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});
const recursive = Recursive({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900", "1000"],
  variable: "--font-recursive",
});

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return constructMetadata({ locale, route: "home" });
}

// Without this every route under `[locale]` is server-rendered on demand, even
// the contact and legal pages that read no data at all.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport = {
  themeColor: "#674839",
  colorScheme: "light",
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Tells next-intl which locale to serve without reading the request, which
  // is what allows everything below to be prerendered instead of rendered on
  // demand. Every page under this layout has to call it too.
  setRequestLocale(locale);

  const messages = await getMessages(locale);

  // `suppressHydrationWarning` on <html>: the intro boot script sets
  // `intro-active` on it before React hydrates, and Lenis adds its own class
  // straight after.
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${roboto.variable} ${recursive.variable} overflow-x-hidden max-md:min-h-svh`}
      >
        <IntroOverlay />
        <Suspense fallback={null}>
          <GoogleAnalytics GA_MEASUREMENT_ID="G-EB4XXB3ES6" />
        </Suspense>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CurtainProvider>
            <SkipLink />
            <Header />
            <main id="main-content" tabIndex={-1}>
              <LenisScroll />
              {children}
            </main>
            <Footer />
            <CookieBanner />
            <Analytics />
            <Toaster />
            <LanguageSwapOverlay />
          </CurtainProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
