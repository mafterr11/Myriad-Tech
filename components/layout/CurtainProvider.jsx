"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "@/i18n/navigation";

// Route changes are hidden behind a two-layer accent curtain: it sweeps up over
// the page we are leaving, the brand mark shows while the new route commits,
// then it sweeps off the top. Framer alone cannot do this in the App Router --
// by the time `children` changes the old tree is already gone -- so the links
// hand navigation to this provider instead, which pushes the route while the
// curtain is on its way in.
const CurtainContext = createContext(null);

const IDLE_FALLBACK = { enabled: false, navigate: null };

export const useCurtain = () => useContext(CurtainContext) ?? IDLE_FALLBACK;

const EASE = [0.76, 0, 0.24, 1];
const MARK_EASE = [0.22, 1, 0.36, 1];

// The first route change of a session gets the whole thing, about 1.6s. Every
// one after that runs the same motion a third quicker, because a curtain you
// have already read starts to feel like waiting.
//
// The frequency is deliberately not what changes. The curtain is not only
// decoration: it covers the RSC fetch so a slow route reads as intentional
// rather than frozen, and it hides the jump back to the top of the page. Show
// it once and then stop and navigation behaves two different ways in one
// session, which reads as a bug rather than as restraint.
const TIMING = {
  full: {
    cover: 0.55,
    lift: 0.66,
    panelDelay: 0.09,
    markDelay: 0.18,
    markIn: 0.46,
    markOut: 0.32,
    hold: 220,
  },
  trim: {
    cover: 0.48,
    lift: 0.48,
    panelDelay: 0.07,
    markDelay: 0.12,
    markIn: 0.34,
    markOut: 0.24,
    hold: 120,
  },
};

const SEEN_KEY = "mt-curtain-seen";

// A slow network must not leave the curtain up forever.
const ARRIVAL_TIMEOUT_MS = 2200;

const panelVariants = (timing, delay) => ({
  hidden: { y: "100%", transition: { duration: 0 } },
  cover: {
    y: "0%",
    transition: { duration: timing.cover, ease: EASE, delay },
  },
  lift: {
    y: "-100%",
    transition: { duration: timing.lift, ease: EASE, delay },
  },
});

const markVariants = (timing) => ({
  hidden: { opacity: 0, scale: 0.7, rotate: -35, transition: { duration: 0 } },
  cover: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: timing.markIn,
      ease: MARK_EASE,
      delay: timing.markDelay,
    },
  },
  lift: {
    opacity: 0,
    scale: 1.25,
    rotate: 20,
    transition: { duration: timing.markOut, ease: "easeIn" },
  },
});

const CurtainMark = ({ variants }) => (
  <motion.div className="curtain-mark" variants={variants} aria-hidden="true">
    <span className="curtain-petal curtain-petal-corner" />
    <span className="curtain-petal curtain-petal-centre" />
    <span className="curtain-petal curtain-petal-centre" />
    <span className="curtain-petal curtain-petal-corner" />
    <span className="curtain-dot" />
  </motion.div>
);

const CurtainProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  // "idle" -> "covering" -> "revealing" -> "idle".
  const [phase, setPhase] = useState("idle");
  const [mode, setMode] = useState("full");

  // Whether this session has already been shown the long version. Read lazily
  // rather than in a state initialiser: it must not reach the first render, or
  // server and client disagree.
  const seenRef = useRef(false);
  const modeRef = useRef("full");
  const targetRef = useRef(null);
  const coveredRef = useRef(false);
  const arrivedRef = useRef(false);
  const holdRef = useRef(null);
  const timeoutRef = useRef(null);

  // The admin panel is a tool, not a showpiece; it navigates instantly.
  const isAdmin =
    (pathname || "/").startsWith("/admin") ||
    (pathname || "/").startsWith("/admin-login");
  const enabled = !prefersReducedMotion && !isAdmin;

  const clearTimers = useCallback(() => {
    if (holdRef.current) clearTimeout(holdRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    holdRef.current = null;
    timeoutRef.current = null;
  }, []);

  useEffect(() => {
    try {
      seenRef.current = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch (error) {
      // Private modes can throw on read. One long curtain is no great loss.
      seenRef.current = false;
    }
  }, []);

  const reveal = useCallback(() => {
    clearTimers();
    holdRef.current = setTimeout(
      () => setPhase("revealing"),
      TIMING[modeRef.current].hold,
    );
  }, [clearTimers]);

  const maybeReveal = useCallback(() => {
    if (!coveredRef.current || !arrivedRef.current) return;
    reveal();
  }, [reveal]);

  const navigate = useCallback(
    (href, locale, { replace = false } = {}) => {
      const options = locale ? { locale } : undefined;
      const go = (target, opts) =>
        replace ? router.replace(target, opts) : router.push(target, opts);

      if (!enabled) {
        go(href, options);
        return;
      }

      const nextMode = seenRef.current ? "trim" : "full";
      modeRef.current = nextMode;
      setMode(nextMode);
      seenRef.current = true;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch (error) {
        // Nothing to do; the curtain just stays long for this visitor.
      }

      clearTimers();
      coveredRef.current = false;
      // A locale switch keeps the same internal pathname, so there is no path
      // change to wait for -- the cover animation is the only gate.
      arrivedRef.current = false;
      targetRef.current = locale
        ? null
        : href.split("#")[0].split("?")[0] || "/";

      setPhase("covering");
      go(href, options);

      timeoutRef.current = setTimeout(() => {
        arrivedRef.current = true;
        maybeReveal();
      }, ARRIVAL_TIMEOUT_MS);

      if (targetRef.current === null) {
        arrivedRef.current = true;
      }
    },
    [clearTimers, enabled, maybeReveal, router],
  );

  useEffect(() => {
    if (phase !== "covering") return;
    if (targetRef.current === null) return;
    if (targetRef.current !== (pathname || "/")) return;

    arrivedRef.current = true;
    maybeReveal();
  }, [maybeReveal, pathname, phase]);

  // rAF stops while a tab is in the background, which stops framer mid-way and
  // means `onAnimationComplete` may never fire. Without a backstop the curtain
  // would still be sitting over the page when the visitor came back, so each
  // phase gets a deadline that pushes it along regardless.
  useEffect(() => {
    if (phase === "idle") return undefined;

    const deadline = phase === "covering" ? 3400 : 1800;
    const timer = setTimeout(() => {
      if (phase === "covering") {
        coveredRef.current = true;
        arrivedRef.current = true;
        setPhase("revealing");
        return;
      }

      coveredRef.current = false;
      arrivedRef.current = false;
      targetRef.current = null;
      setPhase("idle");
    }, deadline);

    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => clearTimers, [clearTimers]);

  const handleCovered = useCallback(() => {
    if (phase !== "covering") return;

    coveredRef.current = true;
    // The new route is painted behind the curtain, so jump it to the top now
    // rather than letting the visitor watch it happen.
    window.scrollTo(0, 0);
    maybeReveal();
  }, [maybeReveal, phase]);

  const handleLifted = useCallback(() => {
    if (phase !== "revealing") return;

    clearTimers();
    coveredRef.current = false;
    arrivedRef.current = false;
    targetRef.current = null;
    setPhase("idle");
  }, [clearTimers, phase]);

  const timing = TIMING[mode];
  const backPanel = useMemo(() => panelVariants(timing, 0), [timing]);
  const frontPanel = useMemo(
    () => panelVariants(timing, timing.panelDelay),
    [timing],
  );
  const mark = useMemo(() => markVariants(timing), [timing]);

  const value = useMemo(() => ({ enabled, navigate }), [enabled, navigate]);

  return (
    <CurtainContext.Provider value={value}>
      {children}
      <div
        className={`curtain-root ${phase === "idle" ? "is-idle" : ""}`}
        aria-hidden="true"
      >
        <motion.div
          className="curtain-panel curtain-panel-back"
          variants={backPanel}
          initial="hidden"
          animate={
            phase === "idle"
              ? "hidden"
              : phase === "covering"
                ? "cover"
                : "lift"
          }
        />
        <motion.div
          className="curtain-panel curtain-panel-front"
          variants={frontPanel}
          initial="hidden"
          animate={
            phase === "idle"
              ? "hidden"
              : phase === "covering"
                ? "cover"
                : "lift"
          }
          onAnimationComplete={(definition) => {
            if (definition === "cover") handleCovered();
            if (definition === "lift") handleLifted();
          }}
        >
          <CurtainMark variants={mark} />
        </motion.div>
      </div>
    </CurtainContext.Provider>
  );
};

export default CurtainProvider;
