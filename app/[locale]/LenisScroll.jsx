"use client";

import Lenis from "lenis";
import { useEffect } from "react";

const LenisScroll = () => {
  useEffect(() => {
    // Smooth scrolling overrides the scrolling the operating system was asked
    // to do, so it stays off for anyone who set prefers-reduced-motion.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return undefined;

    const lenis = new Lenis();
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    // Previously the loop and the instance both outlived the component, so
    // every remount left another rAF callback running for the life of the tab.
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
};

export default LenisScroll;
