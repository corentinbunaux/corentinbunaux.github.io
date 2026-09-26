"use client";

import dynamic from "next/dynamic";
import { useDesktopMotionGate } from "./useDesktopMotionGate";

/**
 * Decorative background layer for the hero (PORT-019). Sits behind all of
 * `homepage.jsx`'s content via DOM order (first child, no z-index needed)
 * and never intercepts interaction with it.
 *
 * The three.js chunk is only ever fetched once the gate has already decided
 * to render: `next/dynamic` with `ssr:false` is declared here, but nothing
 * imports it until `useDesktopMotionGate()` returns "render" below.
 */
const HeroMesh = dynamic(
  () => import("./HeroMesh").then((m) => m.HeroMesh),
  { ssr: false },
);

export function HeroCanvas() {
  const gate = useDesktopMotionGate();

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
