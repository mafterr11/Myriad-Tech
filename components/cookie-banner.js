"use client";
{
  /* Google Analytics Component*/
}

import { useState, useEffect } from "react";
import { getLocalStorage, setLocalStorage } from "@/lib/storage-helper";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

// CookieBanner component that displays a banner for cookie consent.
export default function CookieBanner() {
  const [cookieConsent, setCookieConsent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("Cookies");
  // Retrieve cookie consent status from local storage on component mount
  useEffect(() => {
    const storedCookieConsent = getLocalStorage("cookie_consent", null);
    console.log("Cookie Consent retrieved from storage: ", storedCookieConsent);
    setCookieConsent(storedCookieConsent);
    setIsLoading(false);
  }, []);

  // Update local storage and Google Analytics consent status when cookieConsent changes
  useEffect(() => {
    if (cookieConsent !== null) {
      setLocalStorage("cookie_consent", cookieConsent);
    }

    const newValue = cookieConsent ? "granted" : "denied";

    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: newValue,
      });
    }
  }, [cookieConsent]);

  // Do not render the banner if loading or consent is already given
  if (isLoading || cookieConsent !== null) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-10 left-0 right-0 z-30 mx-auto mt-10 max-w-fit ${cookieConsent == null ? "visible block" : "none hidden"}`}
    >
      <div className="relative">
        <div className="m-3 flex items-center gap-2 rounded-xl border-2 border-solid border-accent bg-body p-5 max-md:flex-col max-md:items-start">
          <div className="text-left">
            <p className="mr-3 max-w-xl">
              {t("text1")}{" "}
              <Link className="font-semibold" href="/politica-cookies">
                {t("name")}
              </Link>{" "}
              {t("text2")}
            </p>
          </div>
          <div className="flex flex-col gap-2 max-md:flex-row">
            <button
              className="group rounded-xs bg-accent px-4 py-2 text-white cursor-pointer"
              onClick={() => setCookieConsent(true)}
            >
              {t("buttons.yes")}
            </button>
            <button
              className="bg-red-500 rounded-xs border border-black/50 px-4 py-2 text-white cursor-pointer"
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
