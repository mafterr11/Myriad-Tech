"use client";

import { useCallback, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  advanceLanguageSwap,
  elapsedSince,
  endLanguageSwap,
  markLanguageSwapArrived,
  useLanguageSwap,
} from "@/lib/language-swap";

// The full-screen version of the language switch in the header: the same two
// slots and the same sliding thumb, blown up, so the click and what happens on
// screen are visibly the same gesture. Both codes stay on screen the whole
// time; only the thumb and the emphasis move, and they move at the moment the
// page underneath has actually changed language.
//
// It is CSS from top to bottom rather than framer, and its state lives in
// lib/language-swap.js rather than in this component, because a locale change
// unmounts this component -- see the note there.
//
// This component owns the navigation, and fires it only once the panel is
// down. Starting the sweep and the route change together meant the rebuild --
// which is the whole page tree, so tens of milliseconds of blocked main thread
// -- landed in the middle of the sweep and destroyed the node it was running
// on. The panel picked itself back up about 100ms behind where it should have
// been, which is exactly the stutter this arrangement avoids: every phase that
// moves now runs either side of the rebuild, never across it.
const NAMES = { ro: "Română", en: "English" };
const CODES = ["ro", "en"];

// Must match the durations in the `language swap` block of globals.css.
const COVER_MS = 480;
const SWAP_MS = 380;
const LIFT_MS = 500;

// A route that never arrives must not leave the panel parked over the page.
// Generous on purpose: it is the last resort, not a second clock racing the
// real one, and lifting on a page that failed to change is the worse outcome.
const ARRIVAL_TIMEOUT_MS = 3500;
const WATCHDOG_SLACK_MS = 900;

// The intro taught this the hard way: a `setTimeout` keeps counting in a
// backgrounded tab while the document timeline -- and with it every keyframe --
// sits frozen. So the fallbacks below re-arm instead of firing while the tab is
// hidden. A frozen animation is not a stuck one.
const armFallback = (ms, run) => {
  let timer;

  const arm = () => {
    timer = setTimeout(() => {
      if (document.visibilityState === "hidden") {
        arm();
        return;
      }
      run();
    }, ms);
  };

  arm();
  return () => clearTimeout(timer);
};

const onceAnimationEnd = (node, prefix, run) => {
  if (!node) return () => {};

  const handleEnd = (event) => {
    if (event.target !== node) return;
    if (!event.animationName.startsWith(prefix)) return;
    run();
  };

  node.addEventListener("animationend", handleEnd);
  return () => node.removeEventListener("animationend", handleEnd);
};

const LanguageSwapOverlay = () => {
  const swap = useLanguageSwap();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef(null);
  const thumbRef = useRef(null);

  // Captured once per phase, at the first render of whichever instance is
  // alive. `animation-delay` is measured from the moment the animation is
  // applied to the node, so it has to be worked out when the node appears and
  // left alone afterwards -- recomputing it later would shunt a running sweep
  // forwards. With the navigation deferred nothing should normally interrupt a
  // sweep at all; this is what keeps a late arrival from replaying one.
  const offsetRef = useRef({ key: 0, offset: 0 });
  if (swap.phase !== "idle" && offsetRef.current.key !== swap.phaseStartedAt) {
    offsetRef.current = {
      key: swap.phaseStartedAt,
      offset: elapsedSince(swap.phaseStartedAt),
    };
  }

  // The new locale is live. On the usual path this instance was built by the
  // remount and mounts already holding it; if Next ever reconciles instead of
  // remounting, the same effect catches the re-render.
  useEffect(() => {
    if (swap.phase === "idle" || swap.arrived) return;
    if (locale !== swap.to) return;

    markLanguageSwapArrived();
  }, [locale, swap.arrived, swap.phase, swap.to]);

  // Behind the panel, put the page back where it was being read. Next is asked
  // not to scroll because this is the same page in another language, not a new
  // one; this only corrects the position if the rebuild lost it, and only once,
  // so it never fights a visitor who has started scrolling again.
  const restoredRef = useRef(0);
  useEffect(() => {
    if (!swap.arrived || swap.phase === "idle") return;
    if (restoredRef.current === swap.startedAt) return;

    restoredRef.current = swap.startedAt;
    if (Math.abs(window.scrollY - swap.scrollY) < 2) return;
    window.scrollTo(0, swap.scrollY);
  }, [swap.arrived, swap.phase, swap.scrollY, swap.startedAt]);

  // cover -> hold. The phase is advanced before the route change so the panel
  // is already on its static covered rule when the rebuild arrives.
  const navigatedRef = useRef(0);
  const leaveCover = useCallback(() => {
    advanceLanguageSwap("hold");

    if (navigatedRef.current === swap.startedAt) return;
    navigatedRef.current = swap.startedAt;
    router.replace(pathname || "/", { locale: swap.to, scroll: false });
  }, [pathname, router, swap.startedAt, swap.to]);

  useEffect(() => {
    if (swap.phase !== "cover") return undefined;

    // Nothing left to wait for: `hold` paints the panel in the exact position
    // the sweep ends in, so there is nothing to see either.
    if (elapsedSince(swap.phaseStartedAt) >= COVER_MS) {
      leaveCover();
      return undefined;
    }

    const stopListening = onceAnimationEnd(
      panelRef.current,
      "lang-panel-sweep",
      leaveCover,
    );
    const disarm = armFallback(COVER_MS + WATCHDOG_SLACK_MS, leaveCover);

    return () => {
      stopListening();
      disarm();
    };
  }, [leaveCover, swap.phase, swap.phaseStartedAt]);

  // hold -> swap, once the page underneath really has changed language.
  useEffect(() => {
    if (swap.phase !== "hold") return undefined;
    if (swap.arrived) {
      advanceLanguageSwap("swap");
      return undefined;
    }

    const timer = setTimeout(markLanguageSwapArrived, ARRIVAL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [swap.arrived, swap.phase]);

  // swap -> lift, once the thumb has finished travelling.
  useEffect(() => {
    if (swap.phase !== "swap") return undefined;

    const toLift = () => advanceLanguageSwap("lift");
    const stopListening = onceAnimationEnd(
      thumbRef.current,
      "lang-thumb-to",
      toLift,
    );
    const disarm = armFallback(SWAP_MS + WATCHDOG_SLACK_MS, toLift);

    return () => {
      stopListening();
      disarm();
    };
  }, [swap.phase]);

  // lift -> idle.
  useEffect(() => {
    if (swap.phase !== "lift") return undefined;

    if (elapsedSince(swap.phaseStartedAt) >= LIFT_MS) {
      endLanguageSwap();
      return undefined;
    }

    const stopListening = onceAnimationEnd(
      panelRef.current,
      "lang-panel-exit",
      endLanguageSwap,
    );
    const disarm = armFallback(LIFT_MS + WATCHDOG_SLACK_MS, endLanguageSwap);

    return () => {
      stopListening();
      disarm();
    };
  }, [swap.phase, swap.phaseStartedAt]);

  const { phase, from, to } = swap;
  const active = phase === "cover" || phase === "hold" ? from : to;
  const sweeping = phase === "cover" || phase === "lift";

  return (
    <div
      className="lang-swap-root"
      data-phase={phase}
      data-to={to || undefined}
      style={
        sweeping
          ? { "--lang-swap-offset": `${offsetRef.current.offset}ms` }
          : undefined
      }
      aria-hidden="true"
    >
      <div className="lang-swap-panel lang-swap-panel-back" />
      <div className="lang-swap-panel lang-swap-panel-front" ref={panelRef}>
        <div className="lang-swap-inner">
          <span className="lang-swap-eyebrow">Limbă &middot; Language</span>
          {/* The codes are drawn twice: once dim, underneath the thumb, and
              once in accent on top of it, clipped to exactly the thumb's
              rectangle. Whatever the thumb covers reads dark-on-paper and
              whatever it does not reads paper-on-accent, at every instant and
              with no timing to keep in step -- the clip runs on the same
              duration and easing as the travel. Fading the colours instead
              left the code the thumb was arriving under washed out,
              paper-on-paper, for about a sixth of a second. */}
          <div className="lang-swap-pill">
            <span className="lang-swap-codes">
              {CODES.map((code) => (
                <span key={code} className="lang-swap-code">
                  {code.toUpperCase()}
                </span>
              ))}
            </span>
            <span className="lang-swap-thumb" ref={thumbRef} />
            <span className="lang-swap-codes lang-swap-codes-on">
              {CODES.map((code) => (
                <span key={code} className="lang-swap-code">
                  {code.toUpperCase()}
                </span>
              ))}
            </span>
          </div>
          <div className="lang-swap-names">
            {CODES.map((code) => (
              <span
                key={code}
                className="lang-swap-name"
                data-state={code === active ? "on" : "off"}
              >
                {NAMES[code]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwapOverlay;
