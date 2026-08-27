"use client";

import { forwardRef } from "react";
import { Link as IntlLink, usePathname } from "@/i18n/navigation";
import { useCurtain } from "./CurtainProvider";

// Drop-in replacement for the next-intl `Link`. Everything about it is the same
// except that an ordinary left click is handed to the curtain, which pushes the
// route itself once it has started covering the page. Anything the curtain
// cannot own -- new tabs, modified clicks, hash jumps, object hrefs, reduced
// motion, and links that change the locale -- falls straight through to the
// normal link behaviour.
//
// The locale is the interesting one: switching it changes a route segment, so
// Next rebuilds everything under app/[locale]/layout.jsx and the curtain's own
// state goes with it, leaving a sweep that flashes and cuts out. The language
// switch has its own overlay for that, built to survive the rebuild --
// components/layout/LanguageSwapOverlay.jsx.
const TransitionLink = forwardRef(function TransitionLink(
  { href, locale, onClick, ...props },
  ref,
) {
  const { enabled, navigate } = useCurtain();
  const pathname = usePathname();

  const handleClick = (event) => {
    onClick?.(event);

    if (event.defaultPrevented) return;
    if (!enabled || typeof navigate !== "function") return;
    if (locale) return;
    if (typeof href !== "string" || !href.startsWith("/")) return;
    if (props.target && props.target !== "_self") return;
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const path = href.split("#")[0].split("?")[0] || "/";
    // Same page: nothing to cover.
    if (path === (pathname || "/")) return;

    event.preventDefault();
    navigate(href);
  };

  return (
    <IntlLink
      ref={ref}
      href={href}
      locale={locale}
      onClick={handleClick}
      {...props}
    />
  );
});

export default TransitionLink;
