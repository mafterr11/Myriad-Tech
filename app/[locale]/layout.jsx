import { Roboto, Recursive } from "next/font/google";
import { notFound } from "next/navigation";
import "./globals.css";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { Analytics } from "@vercel/analytics/react";
import { constructMetadata } from "@/lib/utils";
import { Suspense } from "react";
import GoogleAnalytics from "@/components/google-analytics";
import CookieBanner from "@/components/cookie-banner";
import { getMessages } from "next-intl/server";
import LenisScroll from "./LenisScroll";
import Script from "next/script";
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

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages(locale);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;

  return (
    <html lang={locale}>
      <head>
        {siteKey ? (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <Suspense fallback={null}>
        <GoogleAnalytics GA_MEASUREMENT_ID="G-EB4XXB3ES6" />
      </Suspense>
      <body
        className={`${roboto.variable} ${recursive.variable} overflow-x-hidden max-md:min-h-svh`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main>
            <LenisScroll />
            {children}
          </main>
          <Footer />
          <CookieBanner />
          <Analytics />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
