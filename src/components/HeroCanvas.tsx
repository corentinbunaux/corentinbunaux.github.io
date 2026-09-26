"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Decorative background layer for the hero (PORT-019). Sits behind all of
 * `homepage.jsx`'s content via DOM order (first child, no z-index needed)
 * and never intercepts interaction with it.
 *
 * The three.js chunk is only ever fetched once this gate has already
 * decided to render: `next/dynamic` with `ssr:false` is declared here, but
 * nothing imports it until `gate === "render"` below.
 */
const HeroMesh = dynamic(
  () => import("./HeroMesh").then((m) => m.HeroMesh),
  { ssr: false },
);

const DESKTOP_QUERY = "(min-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type Gate = "pending" | "render" | "fallback";

export function HeroCanvas() {
  const [gate, setGate] = useState<Gate>("pending");

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);

    const evaluate = () => {
      // Reduced motion wins over viewport width, same as the PORT-003 spike.
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

  if (gate !== "render") {
    // The hero is already a complete design without the mesh (that's its
    // current, shipped state) - no replacement image needed, just nothing.
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <HeroMesh />
    </div>
  );
}
