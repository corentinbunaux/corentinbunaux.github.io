"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { useDesktopMotionGate } from "./useDesktopMotionGate";

const SafranAccent = dynamic(
  () => import("./SafranAccent").then((m) => m.SafranAccent),
  { ssr: false },
);
const QuimesisAccent = dynamic(
  () => import("./QuimesisAccent").then((m) => m.QuimesisAccent),
  { ssr: false },
);

/** `href` -> accent component. Add an entry here to give another project page its own accent. */
const ACCENTS: Record<string, ComponentType> = {
  "internships/safran": SafranAccent,
  "internships/quimesis": QuimesisAccent,
};

export type ProjectAccent3DProps = {
  href: string;
};

/**
 * Contextual 3D accent for a project page (PORT-020) - same gate as the
 * hero (`useDesktopMotionGate`), purely decorative (`pointer-events-none`,
 * `aria-hidden`), renders nothing for a project that has none.
 */
export function ProjectAccent3D({ href }: ProjectAccent3DProps) {
  const gate = useDesktopMotionGate();
  const Accent = ACCENTS[href];

  // No wrapper at all when this project has no accent, or the gate says no -
  // an empty floated box would still reserve blank space on every other
  // project page otherwise.
  if (!Accent || gate !== "render") return null;

  return (
    <div
      className="pointer-events-none float-right mb-4 ml-6 hidden h-40 w-40 lg:block"
      aria-hidden="true"
    >
      <Accent />
    </div>
  );
}
