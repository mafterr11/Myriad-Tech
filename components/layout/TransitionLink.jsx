"use client";

import { forwardRef } from "react";
import { Link as IntlLink, usePathname } from "@/i18n/navigation";
import { useCurtain } from "./CurtainProvider";

// Drop-in replacement for the next-intl `Link`. Everything about it is the same
// except that an ordinary left click is handed to the curtain, which pushes the
// route itself once it has started covering the page. Anything the curtain
// cannot own -- new tabs, modified clicks, hash jumps, object hrefs, reduced
// motion -- falls straight through to the normal link behaviour.
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
    // Same page and no locale change: nothing to cover.
    if (!locale && path === (pathname || "/")) return;

    event.preventDefault();
    navigate(href, locale);
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
