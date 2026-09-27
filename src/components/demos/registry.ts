import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DemoId } from "./demoIds";

/** "3d": three.js, desktop only (useDesktopMotionGate). "2d": DOM/SVG, everywhere. */
export type DemoKind = "3d" | "2d";

export interface DemoEntry {
  readonly id: DemoId;
  readonly kind: DemoKind;
  /** false = declared but not implemented yet: DemoSection skips it. */
  readonly ready: boolean;
  readonly Component: ComponentType;
}

const SafranEarthDemo = dynamic(() => import("./SafranEarthDemo").then((m) => m.SafranEarthDemo), { ssr: false });
const QuimesisFragmentsDemo = dynamic(() => import("./QuimesisFragmentsDemo").then((m) => m.QuimesisFragmentsDemo), { ssr: false });
const QuimesisJawDemo = dynamic(() => import("./QuimesisJawDemo").then((m) => m.QuimesisJawDemo), { ssr: false });
const SncfTrainDemo = dynamic(() => import("./SncfTrainDemo").then((m) => m.SncfTrainDemo), { ssr: false });
const SpaceTimeDemo = dynamic(() => import("./SpaceTimeDemo").then((m) => m.SpaceTimeDemo), { ssr: false });
const MinesweeperDemo = dynamic(() => import("./MinesweeperDemo").then((m) => m.MinesweeperDemo), { ssr: false });
const GuardsDemo = dynamic(() => import("./GuardsDemo").then((m) => m.GuardsDemo), { ssr: false });
const TypingDemo = dynamic(() => import("./TypingDemo").then((m) => m.TypingDemo), { ssr: false });
const PredictDemo = dynamic(() => import("./PredictDemo").then((m) => m.PredictDemo), { ssr: false });
const ParkingCarDemo = dynamic(() => import("./ParkingCarDemo").then((m) => m.ParkingCarDemo), { ssr: false });
const ExoArmDemo = dynamic(() => import("./ExoArmDemo").then((m) => m.ExoArmDemo), { ssr: false });

/** Project `href` -> its demos, in display order. */
export const DEMOS: Readonly<Record<string, readonly DemoEntry[]>> = {
  "internships/safran": [
    // PORT-045 rewrites SafranEarthDemo.tsx (ready from the start: wraps the old accent)
    {
      id: "safran-earth",
      kind: "3d",
      ready: true,
      Component: SafranEarthDemo,
    },
  ],

  "internships/quimesis": [
    // Kept as-is: Corentin's first 3D animation
    {
      id: "quimesis-fragments",
      kind: "3d",
      ready: true,
      Component: QuimesisFragmentsDemo,
    },

    // PORT-049
    {
      id: "quimesis-jaw",
      kind: "3d",
      ready: false,
      Component: QuimesisJawDemo,
    },
  ],

  "research/sncf": [
    // PORT-046
    {
      id: "sncf-train",
      kind: "3d",
      ready: true,
      Component: SncfTrainDemo,
    },

    // PORT-042
    {
      id: "sncf-spacetime",
      kind: "2d",
      ready: true,
      Component: SpaceTimeDemo,
    },
  ],

  "emse/minesweeper": [
    // PORT-038
    {
      id: "minesweeper",
      kind: "2d",
      ready: true,
      Component: MinesweeperDemo,
    },
  ],

  "emse/programming": [
    // PORT-039
    {
      id: "guards",
      kind: "2d",
      ready: true,
      Component: GuardsDemo,
    },

    // PORT-040
    {
      id: "typing",
      kind: "2d",
      ready: true,
      Component: TypingDemo,
    },

    // PORT-041
    {
      id: "predict",
      kind: "2d",
      ready: true,
      Component: PredictDemo,
    },
  ],

  "emse/embedded": [
    // PORT-047
    {
      id: "parking-car",
      kind: "3d",
      ready: true,
      Component: ParkingCarDemo,
    },
  ],

  "cpge_tipe": [
    // PORT-048
    {
      id: "exo-arm",
      kind: "3d",
      ready: true,
      Component: ExoArmDemo,
    },
  ],
};
