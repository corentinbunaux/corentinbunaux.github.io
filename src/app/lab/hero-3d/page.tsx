"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useFpsMeter } from "../../../components/lab/useFpsMeter";

/**
 * PORT-003 spike — throwaway route, NOT part of the real site.
 *
 * Isolated on purpose: wiring the mesh into the actual hero
 * (`src/components/homepage.jsx`) is PORT-019's job and must not happen here.
 * Delete this route once the GO/NO-GO verdict is recorded and acted on.
 */

// Lazy so the three.js chunk is fetched only once the guard below says yes.
// `ssr: false` matters for the static export: there is no DOM at build time.
const HeroMesh = dynamic(
  () => import("../../../components/lab/HeroMesh").then((m) => m.HeroMesh),
  { ssr: false },
);

const DESKTOP_QUERY = "(min-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type Gate =
  | { state: "pending" }
  | { state: "render" }
  | { state: "fallback"; reason: "viewport" | "reduced-motion" };

export default function HeroThreeDLabPage() {
  const [gate, setGate] = useState<Gate>({ state: "pending" });
  const { stats, tick, reset } = useFpsMeter();

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);

    const evaluate = () => {
      // Reduced motion wins over viewport width: an explicit accessibility
      // preference is not something a wide screen should override.
      if (reducedMotion.matches) {
        setGate({ state: "fallback", reason: "reduced-motion" });
      } else if (!desktop.matches) {
        setGate({ state: "fallback", reason: "viewport" });
      } else {
        setGate({ state: "render" });
      }
      reset();
    };

    evaluate();
    desktop.addEventListener("change", evaluate);
    reducedMotion.addEventListener("change", evaluate);

    return () => {
      desktop.removeEventListener("change", evaluate);
      reducedMotion.removeEventListener("change", evaluate);
    };
  }, [reset]);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <header className="mx-auto mb-4 max-w-5xl">
        <h1 className="text-xl font-semibold">PORT-003 — three.js hero spike</h1>
        <p className="text-sm text-slate-400">
          Prototype jetable. Bouger le curseur sur le cadre ci-dessous, relever
          les FPS. Sous 1024px ou avec{" "}
          <code className="text-slate-300">prefers-reduced-motion</code>, le
          repli statique doit s&apos;afficher et aucun chunk three.js ne doit
          être téléchargé.
        </p>
      </header>

      <section
        className="relative mx-auto h-[70vh] max-w-5xl overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
        aria-label="Prototype de maillage réactif au curseur"
      >
        {gate.state === "render" ? <HeroMesh onFrame={tick} /> : null}

        {gate.state === "fallback" ? <StaticFallback reason={gate.reason} /> : null}

        {gate.state === "render" ? (
          <div
            className="absolute right-3 top-3 rounded-lg bg-slate-950/80 px-3 py-2 font-mono text-xs leading-5 text-emerald-300"
            role="status"
            aria-live="off"
          >
            <div>FPS {stats.current.toFixed(0)}</div>
            <div>moy {stats.average.toFixed(1)}</div>
            <div>min {stats.min.toFixed(1)}</div>
            <div className="text-slate-500">n={stats.samples}</div>
          </div>
        ) : null}
      </section>

      <p className="mx-auto mt-4 max-w-5xl text-xs text-slate-500">
        État du garde :{" "}
        <span className="font-mono text-slate-300">
          {gate.state === "pending" ? "évaluation…" : gate.state}
          {gate.state === "fallback" ? ` (${gate.reason})` : ""}
        </span>
      </p>
    </main>
  );
}

/**
 * Placeholder standing in for the real static hero image. Producing that asset
 * is explicitly out of scope for the spike; what matters here is that this path
 * renders without importing three.js at all.
 */
function StaticFallback({ reason }: { reason: "viewport" | "reduced-motion" }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_40%,#1e3a8a_0%,#0f172a_70%)] text-center">
      <p className="text-sm font-medium text-slate-200">Repli statique</p>
      <p className="max-w-sm px-6 text-xs text-slate-400">
        {reason === "reduced-motion"
          ? "prefers-reduced-motion: reduce — aucune animation, aucun three.js chargé."
          : "Viewport < 1024px — aucune animation, aucun three.js chargé."}
      </p>
    </div>
  );
}
