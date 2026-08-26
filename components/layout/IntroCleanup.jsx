"use client";

import { useEffect } from "react";

// Dropping `intro-active` puts the panel back to `display: none` and unlocks
// the document. Only the class is touched -- the panel itself is React's, see
// IntroOverlay.
//
// This deliberately does *not* run off a clock. Two things broke when it did,
// both of them showing up when several tabs were opened at once:
//
//   * A hidden tab has its document timeline frozen, so the keyframes sit at
//     frame 0 while a `setTimeout` merrily counts down and takes the class away
//     underneath them. Focus the tab later and the intro had already "finished"
//     without ever drawing.
//   * Three tabs loading at once starve the CPU, and hydration can land after
//     the intro's nominal end. The remaining time then computed to zero and the
//     panel was cut the moment React mounted.
//
// `animationend` has neither problem: it fires when the lift actually finishes,
// however long the tab took to get around to running it.
const LIFT_ANIMATION = "intro-lift";
// Only a safety net, and it refuses to fire while the tab is hidden -- a frozen
// animation is not a stuck one.
const FALLBACK_MS = 9000;

const IntroCleanup = () => {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("intro-active")) return undefined;

    const overlay = document.getElementById("intro-overlay");
    if (!overlay) {
      root.classList.remove("intro-active");
      return undefined;
    }

    let timer;

    const finish = () => {
      clearTimeout(timer);
      overlay.removeEventListener("animationend", handleEnd);
      root.classList.remove("intro-active");
    };

    function handleEnd(event) {
      if (event.target !== overlay) return;
      if (event.animationName !== LIFT_ANIMATION) return;
      finish();
    }

    const arm = () => {
      timer = setTimeout(() => {
        if (document.visibilityState === "hidden") {
          arm();
          return;
        }
        finish();
      }, FALLBACK_MS);
    };

    overlay.addEventListener("animationend", handleEnd);
    arm();

    return () => {
      clearTimeout(timer);
      overlay.removeEventListener("animationend", handleEnd);
    };
  }, []);

  return null;
};

export default IntroCleanup;
