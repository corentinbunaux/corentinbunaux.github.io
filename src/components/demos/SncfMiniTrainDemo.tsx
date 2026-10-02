"use client";

/**
 * A thin decorative strip: a stylised train looping left to right on a
 * track. Pure CSS animation, no three.js — this is "kind: 2d" so it runs
 * everywhere, including mobile and prefers-reduced-motion (where the CSS
 * animation is disabled below, leaving the train parked).
 */
export function SncfMiniTrainDemo() {
  return (
    <div className="relative h-16 w-full overflow-hidden">
      <div className="absolute inset-x-0 bottom-3 h-0.5 bg-second" aria-hidden="true" />
      <div
        className="sncf-mini-train absolute bottom-3 flex -translate-y-1/2 items-end gap-0.5"
        aria-hidden="true"
      >
        <svg viewBox="0 0 64 24" className="h-8 w-20 text-my-green" fill="currentColor">
          <rect x="0" y="6" width="40" height="14" rx="3" />
          <rect x="34" y="0" width="14" height="10" rx="2" />
          <circle cx="10" cy="21" r="3" className="fill-main-text" />
          <circle cx="30" cy="21" r="3" className="fill-main-text" />
        </svg>
        <svg viewBox="0 0 40 24" className="h-7 w-14 text-my-blue" fill="currentColor">
          <rect x="0" y="8" width="40" height="12" rx="2" />
          <rect x="4" y="10" width="8" height="6" className="fill-surface" />
          <rect x="16" y="10" width="8" height="6" className="fill-surface" />
          <rect x="28" y="10" width="8" height="6" className="fill-surface" />
          <circle cx="8" cy="20" r="2.5" className="fill-main-text" />
          <circle cx="32" cy="20" r="2.5" className="fill-main-text" />
        </svg>
      </div>
    </div>
  );
}
