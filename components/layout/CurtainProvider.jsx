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

const COVER = 0.42;
const LIFT = 0.55;
const EASE = [0.76, 0, 0.24, 1];
// How long the mark stays on screen once the curtain is closed and the new
// route has committed.
const HOLD_MS = 170;
// A slow network must not leave the curtain up forever.
const ARRIVAL_TIMEOUT_MS = 2200;

const panel = (delay) => ({
  hidden: { y: "100%", transition: { duration: 0 } },
  cover: { y: "0%", transition: { duration: COVER, ease: EASE, delay } },
  lift: { y: "-100%", transition: { duration: LIFT, ease: EASE, delay } },
});

const backPanel = panel(0);
const frontPanel = panel(0.07);

const markVariants = {
  hidden: { opacity: 0, scale: 0.7, rotate: -35, transition: { duration: 0 } },
  cover: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.16 },
  },
  lift: {
    opacity: 0,
    scale: 1.25,
    rotate: 20,
    transition: { duration: 0.28, ease: "easeIn" },
  },
};

const CurtainMark = () => (
  <motion.div
    className="curtain-mark"
    variants={markVariants}
    aria-hidden="true"
  >
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

  const reveal = useCallback(() => {
    clearTimers();
    holdRef.current = setTimeout(() => setPhase("revealing"), HOLD_MS);
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
          <CurtainMark />
        </motion.div>
      </div>
    </CurtainContext.Provider>
  );
};

export default CurtainProvider;
