"use client";

import { BriefcaseBusiness, GraduationCap } from "lucide-react";

export type TrackKind = "experience" | "education";

/** Small emblem heading each Parcours track. Decorative. */
export function TrackIcon({ kind }: { kind: TrackKind }) {
  const Icon = kind === "experience" ? BriefcaseBusiness : GraduationCap;
  return (
    <span
      aria-hidden="true"
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-second bg-surface text-my-green"
    >
      <Icon className="h-6 w-6" />
    </span>
  );
}
