"use client";

import { useSyncExternalStore } from "react";

// Where a language switch keeps its state, and why it is not React state.
//
// The locale is a dynamic route segment, so `router.replace(path, { locale })`
// changes the `[locale]` cache key and Next tears down everything under
// app/[locale]/layout.jsx and builds it again. Every hook inside goes with it.
// That is what broke the route curtain on a language switch: `phase` was reset
// to "idle" while the panel was still sweeping in, so the accent flashed for a
// few frames and then vanished, leaving the swap itself un-covered.
//
// Module scope outlives the remount -- the module is not re-evaluated by a
// client navigation -- so the swap is tracked here and the overlay reads it
// with `useSyncExternalStore`. A freshly mounted overlay renders whatever phase
// it finds instead of starting from nothing.
//
// Phases:
//   cover  panel sweeps in over the page being left. Nothing is navigating
//          yet: the rebuild must not land on top of a running sweep.
//   hold   panel is down and static. The navigation is fired on the way into
//          this phase, so the rebuild lands here, where there is no motion to
//          interrupt.
//   swap   the two codes trade places, now that the page underneath really has
//          changed language
//   lift   panel sweeps off

const IDLE = Object.freeze({
  phase: "idle",
  from: null,
  to: null,
  startedAt: 0,
  phaseStartedAt: 0,
  arrived: false,
  scrollY: 0,
});

let snapshot = IDLE;
const listeners = new Set();

const now = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

const publish = (next) => {
  snapshot = Object.freeze(next);
  for (const listener of listeners) listener();
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => snapshot;
const getServerSnapshot = () => IDLE;

export const elapsedSince = (startedAt) => Math.max(0, now() - startedAt);

export const startLanguageSwap = (from, to, scrollY = 0) => {
  const startedAt = now();
  publish({
    phase: "cover",
    from,
    to,
    startedAt,
    phaseStartedAt: startedAt,
    arrived: false,
    scrollY,
  });
};

export const advanceLanguageSwap = (phase) => {
  if (snapshot.phase === "idle" || snapshot.phase === phase) return;
  publish({ ...snapshot, phase, phaseStartedAt: now() });
};

export const markLanguageSwapArrived = () => {
  if (snapshot.phase === "idle" || snapshot.arrived) return;
  // Deliberately leaves `phaseStartedAt` alone: arriving is not a new phase,
  // and moving the mark would shunt a running animation.
  publish({ ...snapshot, arrived: true });
};

export const endLanguageSwap = () => {
  if (snapshot.phase === "idle") return;
  publish(IDLE);
};

export const useLanguageSwap = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
