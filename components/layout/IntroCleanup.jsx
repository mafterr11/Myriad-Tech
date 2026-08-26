"use client";

import { useEffect } from "react";

// Dropping `intro-active` puts the panel back to `display: none` and unlocks
// the document. It waits out the full run measured from the timestamp the boot
// script stamped rather than from hydration, which can land much later. Only
// the class is touched -- the panel itself is React's, see IntroOverlay.
const INTRO_MS = 1800;

const IntroCleanup = () => {
  useEffect(() => {
    const root = document.documentElement;

    if (!root.classList.contains("intro-active")) return undefined;

    const started = window.__mtIntroStart ?? Date.now();
    const remaining = Math.max(0, INTRO_MS - (Date.now() - started));
    const timer = setTimeout(
      () => root.classList.remove("intro-active"),
      remaining,
    );

    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default IntroCleanup;
