"use client";

/**
 * A thin decorative strip: a stylised TGV-style train looping left to right
 * on a track (PORT-065 — the previous two-boxes-and-wheels drawing read as
 * a wooden toy train, not an SNCF train). Pure CSS animation, no three.js —
 * this is "kind: 2d" so it runs everywhere, including mobile and
 * prefers-reduced-motion (where the CSS animation is disabled below,
 * leaving the train parked).
 *
 * One continuous silhouette (duckbill nose, low sleek body, no visible
 * wheels — SNCF's TGVs hide their wheels behind a skirt) rather than two
 * separate car shapes: easier to read at this size, and closer to a real
 * TGV's profile. Colours come from design tokens, not literals, so the
 * train still reads correctly in both themes (verified 2026-10-02): the
 * body uses `--main-text` (so it's a light train on the dark theme's dark
 * background, and a dark train on the light theme's light background,
 * exactly like the rest of the site's icon convention), the windows use
 * `--surface` for contrast against whichever body colour is active, and
 * the accent stripe uses `--my-blue`.
 */
export function SncfMiniTrainDemo() {
  return (
    <div className="relative h-16 w-full overflow-hidden">
      <div className="absolute inset-x-0 bottom-3 h-0.5 bg-second" aria-hidden="true" />
      <div
        className="sncf-mini-train absolute bottom-3 h-9 w-[180px] -translate-y-1/2"
        aria-hidden="true"
      >
        <svg viewBox="0 0 220 44" className="h-full w-full">
          {/* Body: duckbill nose at the front, long low profile, tapered tail. */}
          <path
            className="fill-main-text"
            d="M 18,34 C 6,34 2,30 2,26 C 2,22.5 5,20 10,19 C 14,15.5 19,13.5 26,13
               L 188,13 C 197,13 203,16.5 205,21 C 206,24.5 206,28 204,31
               C 202,33.5 198,34.5 193,34.5 Z"
          />
          {/* Windshield, raked back. */}
          <path className="fill-surface" d="M 26,14.5 L 38,14.5 L 33,20.5 L 24,20.5 Z" />
          {/* Continuous window strip. */}
          <rect className="fill-surface" x="42" y="16" width="148" height="6.5" rx="2.2" />
          {/* Accent stripe along the lower body. */}
          <path
            className="fill-my-blue"
            d="M 10,28 C 10,30 12,31.5 16,32 L 195,32 C 200,31.3 203,29.8 204,27.5
               L 204,25.5 L 16,25.5 C 12,25.8 10,26.8 10,28 Z"
          />
          {/* Coupling line between the two visible cars. */}
          <rect className="fill-second" x="120" y="13" width="2.2" height="21" />
          {/* Folded pantograph on the roof. */}
          <g className="stroke-second-text" strokeWidth="1.1" fill="none" strokeLinecap="round">
            <line x1="160" y1="13" x2="160" y2="8" />
            <line x1="160" y1="8" x2="172" y2="5" />
            <line x1="172" y1="5" x2="180" y2="8" />
            <line x1="180" y1="8" x2="180" y2="13" />
          </g>
        </svg>
      </div>
    </div>
  );
}
