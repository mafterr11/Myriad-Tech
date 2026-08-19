"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

// Catches a render or data failure anywhere under [locale] and keeps the
// visitor on the site instead of dropping them onto Next's default error
// screen. The header and footer come from the layout, which survives this
// boundary.
export default function LocaleError({ error, reset }) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    console.error("Unhandled page error", error);
  }, [error]);

  return (
    <div className="bg-grainy flex min-h-svh items-center py-40">
      <div className="container">
        <span className="section-kicker">{t("code")}</span>
        <h1 className="hero-title mt-4 max-w-3xl">{t("title")}</h1>
        <p className="section-copy mt-6 max-w-xl">{t("description")}</p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button onClick={reset} className="group">
            {t("retry")}
            <RotateCcw
              size={17}
              aria-hidden="true"
              className="ml-2 transition-transform duration-300 group-hover:-rotate-45"
            />
          </Button>
          <Link
            href="/"
            className="focus-ring text-black/70 underline-offset-4 hover:underline"
          >
            {t("home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
