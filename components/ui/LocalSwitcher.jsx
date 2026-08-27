"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "./label";
import { startLanguageSwap, useLanguageSwap } from "@/lib/language-swap";

export default function LocalSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const localeActive = useLocale();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const swap = useLanguageSwap();

  // The header renders on the admin pages too, and the admin panel is a tool,
  // not a showpiece -- it switches instantly, same as the route curtain leaves
  // it alone.
  const path = pathname || "/";
  const animated =
    !prefersReducedMotion &&
    !path.startsWith("/admin") &&
    !path.startsWith("/admin-login");

  const toggleLocale = () => {
    // One swap at a time. The switch is behind the panel for most of it, but a
    // second click landing mid-sweep would restart the whole sequence.
    if (swap.phase !== "idle") return;

    const nextLocale = localeActive === "en" ? "ro" : "en";

    // The locale sits in a route segment, so this is not a repaint in place:
    // Next rebuilds the entire page. LanguageSwapOverlay covers that and shows
    // the two codes trading places -- it deliberately does not go through the
    // route curtain, whose state does not survive the rebuild. `scroll: false`
    // keeps the visitor where they were reading rather than sending them to
    // the top of the same page in another language.
    if (animated) {
      startLanguageSwap(localeActive, nextLocale, window.scrollY);
      router.replace(path, { locale: nextLocale, scroll: false });
      return;
    }

    startTransition(() => {
      router.replace(path, { locale: nextLocale });
    });
  };
  return (
    <div className="relative flex items-center justify-center">
      <Switch
        checked={localeActive === "en"}
        onCheckedChange={toggleLocale}
        disabled={isPending}
        id="language-switch"
        aria-label="Language Switch"
      />
      <Label
        htmlFor="language-switch"
        className={`absolute top-[1px] cursor-pointer text-[15px] ${localeActive === "en" ? "left-[0.10rem]" : "right-[0.30rem]"}`}
      >
        {localeActive.toUpperCase()}
      </Label>
    </div>
  );
}
