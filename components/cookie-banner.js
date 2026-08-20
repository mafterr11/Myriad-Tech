"use client";

import { useEffect, useRef, useState } from "react";
import { getLocalStorage, setLocalStorage } from "@/lib/storage-helper";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

// Asks for analytics consent and forwards the answer to Google Consent Mode,
// which starts out denied in components/google-analytics.js.
export default function CookieBanner() {
  const [cookieConsent, setCookieConsent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const acceptRef = useRef(null);
  const t = useTranslations("Cookies");

  useEffect(() => {
    setCookieConsent(getLocalStorage("cookie_consent", null));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (cookieConsent === null) return;

    setLocalStorage("cookie_consent", cookieConsent);

    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: cookieConsent ? "granted" : "denied",
      });
    }
  }, [cookieConsent]);

  const isVisible = !isLoading && cookieConsent === null;

  // Moving focus into the banner is what makes it reachable for keyboard and
  // screen reader users, who would otherwise have to tab past the whole page.
  useEffect(() => {
    if (isVisible) acceptRef.current?.focus();
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t("name")}
      className="fixed right-0 bottom-3 left-0 z-30 mx-auto max-w-fit md:bottom-10"
    >
      <div className="relative">
        <div className="m-2 flex items-center gap-3 rounded-lg border-2 border-solid border-accent bg-body p-3 shadow-[0_10px_30px_rgba(103,72,57,0.14)] md:m-3 md:gap-4 md:rounded-xl md:p-5 max-md:flex-col max-md:items-stretch">
          <div className="text-left">
            <p className="max-w-xl text-[0.8rem] leading-snug md:mr-3 md:text-base md:leading-normal">
              {t("text1")}{" "}
              <Link
                className="focus-ring font-semibold underline underline-offset-4"
                href="/politica-cookies"
              >
                {t("name")}
              </Link>{" "}
              {t("text2")}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 max-md:flex-row max-md:justify-end">
            <button
              ref={acceptRef}
              type="button"
              className="focus-ring group cursor-pointer rounded-xs bg-accent px-4 py-1.5 text-sm text-white md:py-2 md:text-base"
              onClick={() => setCookieConsent(true)}
            >
              {t("buttons.yes")}
            </button>
            <button
              type="button"
              className="focus-ring cursor-pointer rounded-xs border border-black/50 bg-red px-4 py-1.5 text-sm text-white md:py-2 md:text-base"
              onClick={() => setCookieConsent(false)}
            >
              {t("buttons.no")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
