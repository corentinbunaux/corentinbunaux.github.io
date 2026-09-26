"use client";

import { useEffect, useState } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export type MotionGate = "pending" | "render" | "fallback";

/**
 * Shared gate for every decorative three.js accent on the site (hero,
 * Safran, Quimesis): render only on desktop (>=1024px) and only outside
 * `prefers-reduced-motion`. Extracted from HeroCanvas (PORT-019) so the
 * three call sites can't drift out of sync with each other.
 *
 * Callers should not import their three.js component until this returns
 * "render" - pair with `next/dynamic({ ssr: false })` so the chunk is never
 * fetched under either fallback condition.
 */
export function useDesktopMotionGate(): MotionGate {
  const [gate, setGate] = useState<MotionGate>("pending");

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);

    const evaluate = () => {
      // Reduced motion wins over viewport width: an explicit accessibility
      // preference is not something a wide screen should override.
      setGate(reducedMotion.matches || !desktop.matches ? "fallback" : "render");
    };

    evaluate();
    desktop.addEventListener("change", evaluate);
    reducedMotion.addEventListener("change", evaluate);

    return () => {
      desktop.removeEventListener("change", evaluate);
      reducedMotion.removeEventListener("change", evaluate);
    };
  }, []);

  return gate;
}
