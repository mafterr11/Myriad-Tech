"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
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
// unmounts this component -- see the note there. The only phase that can be
// caught mid-flight is the sweep in, and that one resumes from where it was:
// `--lang-swap-offset` is subtracted from every delay, so a panel recreated
// 300ms into a 500ms sweep starts 300ms in rather than starting over.

// Must match the durations in the `language swap` block of globals.css.
const COVER_MS = 580;
const SWAP_MS = 520;
const LIFT_MS = 660;

// A slow route must not leave the panel parked over the page. Long enough that
// it is a genuine backstop rather than a second clock racing the real one.
const ARRIVAL_TIMEOUT_MS = 2400;
const WATCHDOG_SLACK_MS = 900;

const NAMES = { ro: "Română", en: "English" };
const CODES = ["ro", "en"];

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
  const panelRef = useRef(null);
  const thumbRef = useRef(null);

  // Captured once per swap, at the first render of whichever instance is alive.
  // `animation-delay` is measured from the moment the animation is applied to
  // the node, so it has to be worked out when the node appears and left alone
  // afterwards -- recomputing it later would shunt a running sweep forwards.
  const offsetRef = useRef({ startedAt: 0, offset: 0 });
  if (swap.phase !== "idle" && offsetRef.current.startedAt !== swap.startedAt) {
    offsetRef.current = {
      startedAt: swap.startedAt,
      offset: elapsedSince(swap.startedAt),
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
  // not to scroll (`scroll: false` in LocalSwitcher) because this is the same
  // page in another language, not a new one; this only corrects the position if
  // the rebuild lost it, and only once, so it never fights a visitor who has
  // started scrolling again.
  const restoredRef = useRef(0);
  useEffect(() => {
    if (!swap.arrived || swap.phase === "idle") return;
    if (restoredRef.current === swap.startedAt) return;

    restoredRef.current = swap.startedAt;
    if (Math.abs(window.scrollY - swap.scrollY) < 2) return;
    window.scrollTo(0, swap.scrollY);
  }, [swap.arrived, swap.phase, swap.scrollY, swap.startedAt]);

  // cover -> hold, once the panel is down.
  useEffect(() => {
    if (swap.phase !== "cover") return undefined;

    const toHold = () => advanceLanguageSwap("hold");

    // A remount can land after the sweep would already have finished: there is
    // no `animationend` left to wait for, and `hold` paints the panel in the
    // exact position the sweep ends in, so there is nothing to see either.
    if (elapsedSince(swap.startedAt) >= COVER_MS) {
      toHold();
      return undefined;
    }

    const stopListening = onceAnimationEnd(
      panelRef.current,
      "lang-panel-sweep",
      toHold,
    );
    const disarm = armFallback(COVER_MS + WATCHDOG_SLACK_MS, toHold);

    return () => {
      stopListening();
      disarm();
    };
  }, [swap.phase, swap.startedAt]);

  // hold -> swap, once the page underneath really has changed language. If it
  // never does, go anyway: a panel that stays up is worse than one that lifts
  // on a page that failed to change.
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
      "lang-thumb",
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
  }, [swap.phase]);

  const { phase, from, to } = swap;
  const active = phase === "cover" || phase === "hold" ? from : to;

  return (
    <div
      className="lang-swap-root"
      data-phase={phase}
      data-to={to || undefined}
      style={
        phase === "cover"
          ? { "--lang-swap-offset": `${offsetRef.current.offset}ms` }
          : undefined
      }
      aria-hidden="true"
    >
      <div className="lang-swap-panel lang-swap-panel-back" />
      <div className="lang-swap-panel lang-swap-panel-front" ref={panelRef}>
        <div className="lang-swap-inner">
          <span className="lang-swap-eyebrow">Limbă &middot; Language</span>
          <div className="lang-swap-pill">
            <span className="lang-swap-thumb" ref={thumbRef} />
            {CODES.map((code) => (
              <span
                key={code}
                className="lang-swap-code"
                data-state={code === active ? "on" : "off"}
              >
                {code.toUpperCase()}
              </span>
            ))}
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
