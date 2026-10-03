"use client";

import dynamic from "next/dynamic";
import { BriefcaseBusiness, GraduationCap } from "lucide-react";
import { useDesktopMotionGate } from "../useDesktopMotionGate";
import { useTheme } from "../../theme/ThemeContext";

export type TrackKind = "experience" | "education";

// Same footprint in both states so switching gate states never shifts the
// layout (PORT-050): bumped from h-12 to h-14 so the 3D shapes read clearly.
const ICON_WRAPPER_CLASS = "flex h-14 w-14 shrink-0 items-center justify-center";

const TrackIcon3D = dynamic(() => import("./TrackIcon3D").then((m) => m.TrackIcon3D), { ssr: false });

/** Small emblem heading each Parcours track. Decorative. */
export function TrackIcon({ kind }: { kind: TrackKind }) {
  const gate = useDesktopMotionGate();
  const { theme } = useTheme();

  if (gate === "render") {
    // key={theme}: remount so the scene re-reads the design tokens.
    return (
      <span aria-hidden="true" className={ICON_WRAPPER_CLASS}>
        <TrackIcon3D key={theme} kind={kind} />
      </span>
    );
  }

  const Icon = kind === "experience" ? BriefcaseBusiness : GraduationCap;
  return (
    <span
      aria-hidden="true"
      className={`${ICON_WRAPPER_CLASS} rounded-full border border-second bg-surface text-my-green`}
    >
      <Icon className="h-6 w-6" />
    </span>
  );
}
