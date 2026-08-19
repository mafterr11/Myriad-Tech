"use client";

import { createElement, forwardRef, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const MOBILE_QUERY = "(max-width: 767px)";
const MOBILE_OFFSET = 24;
const MOBILE_DURATION = 0.55;
const MOBILE_EASE = [0.22, 1, 0.36, 1];

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const updateViewport = (event) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  return isMobile;
};

const reduceTransition = (transition) => {
  if (!transition || typeof transition !== "object") return transition;

  const reducedTransition = {
    ...transition,
    duration:
      typeof transition.duration === "number"
        ? Math.min(transition.duration, MOBILE_DURATION)
        : MOBILE_DURATION,
    ease: MOBILE_EASE,
  };

  if (typeof transition.delay === "number") {
    reducedTransition.delay = Math.min(transition.delay * 0.25, 0.14);
  }

  return reducedTransition;
};

const reduceVariant = (variant) => {
  if (!variant || typeof variant !== "object" || Array.isArray(variant)) {
    return variant;
  }

  const reducedVariant = { ...variant };

  for (const axis of ["x", "y"]) {
    if (typeof reducedVariant[axis] === "number" && reducedVariant[axis] !== 0) {
      reducedVariant[axis] =
        Math.sign(reducedVariant[axis]) *
        Math.min(Math.abs(reducedVariant[axis]), MOBILE_OFFSET);
    }
  }

  if (reducedVariant.opacity === 0) {
    reducedVariant.opacity = 0.18;
  }

  if (reducedVariant.transition) {
    reducedVariant.transition = reduceTransition(reducedVariant.transition);
  }

  return reducedVariant;
};

// The global `prefers-reduced-motion` rule in globals.css only shortens CSS
// transitions; framer-motion drives these variants from JavaScript and ignores
// it. Flattening every variant to the settled state is what actually stops the
// movement for visitors who asked for less of it.
const getStaticVariants = (variants) => {
  if (!variants || typeof variants !== "object") return variants;

  return Object.fromEntries(
    Object.keys(variants).map((name) => [
      name,
      { opacity: 1, x: 0, y: 0, transition: { duration: 0 } },
    ]),
  );
};

const getMobileVariants = (variants) => {
  if (!variants || typeof variants !== "object") return variants;

  return Object.fromEntries(
    Object.entries(variants).map(([name, variant]) => [
      name,
      reduceVariant(variant),
    ]),
  );
};

const createResponsiveMotion = (Component, displayName) => {
  const ResponsiveMotion = forwardRef(
    ({ variants, viewport, mobileViewport, ...props }, ref) => {
      const isMobile = useIsMobile();
      const prefersReducedMotion = useReducedMotion();
      const responsiveVariants = useMemo(() => {
        if (prefersReducedMotion) return getStaticVariants(variants);
        return isMobile ? getMobileVariants(variants) : variants;
      }, [isMobile, prefersReducedMotion, variants]);
      const responsiveViewport =
        isMobile && mobileViewport ? mobileViewport : viewport;

      return createElement(Component, {
        ...props,
        ref,
        variants: responsiveVariants,
        viewport: responsiveViewport,
      });
    },
  );

  ResponsiveMotion.displayName = displayName;
  return ResponsiveMotion;
};

export const MotionDiv = createResponsiveMotion(motion.div, "MotionDiv");
export const MotionP = createResponsiveMotion(motion.p, "MotionP");
export const MotionH1 = createResponsiveMotion(motion.h1, "MotionH1");
export const MotionH2 = createResponsiveMotion(motion.h2, "MotionH2");
export const MotionSection = createResponsiveMotion(
  motion.section,
  "MotionSection",
);
