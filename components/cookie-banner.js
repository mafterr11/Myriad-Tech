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
      className="fixed right-0 bottom-10 left-0 z-30 mx-auto mt-10 max-w-fit"
    >
      <div className="relative">
        <div className="m-3 flex items-center gap-2 rounded-xl border-2 border-solid border-accent bg-body p-5 shadow-[0_10px_30px_rgba(103,72,57,0.14)] max-md:flex-col max-md:items-start">
          <div className="text-left">
            <p className="mr-3 max-w-xl">
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
          <div className="flex flex-col gap-2 max-md:flex-row">
            <button
              ref={acceptRef}
              type="button"
              className="focus-ring group cursor-pointer rounded-xs bg-accent px-4 py-2 text-white"
              onClick={() => setCookieConsent(true)}
            >
              {t("buttons.yes")}
            </button>
            <button
              type="button"
              className="focus-ring cursor-pointer rounded-xs border border-black/50 bg-red px-4 py-2 text-white"
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
