"use client";

import dynamic from "next/dynamic";
import { OptimizedImage } from "../optimizedImage";
import { useTranslation } from "../../i18n/dictionary";
import { useDesktopMotionGate } from "../useDesktopMotionGate";
import { useTheme } from "../../theme/ThemeContext";

const HeroGlobe = dynamic(() => import("./HeroGlobe").then((m) => m.HeroGlobe), { ssr: false });

/**
 * Right-hand panel of the hero (mockup zone ①): the avatar in a circle,
 * plus (PORT-044) a wireframe globe with the old wheel's icons orbiting it,
 * desktop only, next to the avatar as in the mockup.
 *
 * `justify-center lg:justify-between`: below 1024px the avatar is the only
 * child and stays centered ("comme aujourd'hui"). From 1024px up, the panel
 * always reserves the avatar's final left-hand slot via `justify-between`
 * (with a single flex child that resolves to flex-start) — so whether the
 * globe slot is present (gate === "render") or absent (still "pending", or
 * "fallback" under prefers-reduced-motion) the avatar never moves: no jump
 * when the motion gate resolves. `lg:motion-reduce:justify-center` overrides
 * that back to centered for desktop visitors with reduced motion, purely in
 * CSS (no flash while the JS gate resolves), matching "avatar alone" there.
 */
export function HeroVisual() {
  const t = useTranslation();
  const gate = useDesktopMotionGate();
  const { theme } = useTheme();
  const showGlobe = gate === "render";

  return (
    <div className="relative mx-auto flex aspect-[4/3] w-full max-w-md items-center justify-center gap-6 overflow-hidden rounded-2xl border border-second bg-surface lg:aspect-video lg:max-w-none lg:justify-between lg:gap-8 lg:px-10 lg:py-8 lg:motion-reduce:justify-center">
      {showGlobe && (
        <>
          <span className="pointer-events-none absolute left-[15%] top-[14%] hidden h-1.5 w-1.5 rounded-full bg-second-text lg:block" />
          <span className="pointer-events-none absolute right-[32%] top-[22%] hidden h-1 w-1 rounded-full bg-second-text lg:block" />
          <span className="pointer-events-none absolute right-[10%] bottom-[16%] hidden h-1 w-1 rounded-full bg-second-text lg:block" />
        </>
      )}
      <div className="aspect-square w-2/5 shrink-0 overflow-hidden rounded-full border-2 border-my-green bg-surface-raised lg:w-[38%]">
        <OptimizedImage
          src="/img/avatar"
          alt={t.hero.avatarAlt}
          priority
          sizes="(min-width: 1024px) 20vw, 40vw"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      {showGlobe && (
        <div className="hidden aspect-square w-1/2 shrink-0 lg:block">
          <HeroGlobe key={theme} />
        </div>
      )}
    </div>
  );
}
