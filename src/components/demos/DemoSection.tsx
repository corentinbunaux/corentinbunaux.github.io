"use client";

import { useDesktopMotionGate } from "../useDesktopMotionGate";
import { useTranslation } from "../../i18n/dictionary";
import { useTheme } from "../../theme/ThemeContext";
import { DEMOS, type DemoEntry } from "./registry";

function DemoStage({ demo, className }: { demo: DemoEntry; className?: string }) {
  const gate = useDesktopMotionGate();
  const { theme } = useTheme();
  const t = useTranslation();
  const { Component } = demo;

  if (demo.kind === "2d") {
    return (
      <div className="rounded-2xl border border-second bg-surface p-4 sm:p-6">
        <Component />
      </div>
    );
  }

  return (
    // Fixed 16:9 box in every gate state: no layout shift when the scene mounts.
    <div className={className ?? "relative aspect-video w-full overflow-hidden rounded-2xl border border-second bg-surface"}>
      {gate === "render" && (
        // key={theme}: remount so the scene re-reads the design tokens.
        <Component key={theme} />
      )}
      {gate === "fallback" && (
        <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-second-text">
          {t.demos.desktopOnly}
        </p>
      )}
    </div>
  );
}

export type DemoSectionProps = {
  href: string;
  /** Section number shown above the heading, continuing the article's numbering. */
  number: number;
};

export function DemoSection({ href, number }: DemoSectionProps) {
  const t = useTranslation();
  const demos = (DEMOS[href] ?? []).filter((demo) => demo.ready && demo.placement === "demo");
  if (demos.length === 0) return null;

  return (
    <section aria-labelledby="demo-heading">
      <p className="mb-1 text-sm font-semibold tracking-widest text-my-green">
        {String(number).padStart(2, "0")}
      </p>
      <h2 id="demo-heading" className="mb-4 text-xl font-semibold text-main-text">
        {t.demos.sectionTitle}
      </h2>
      <div className="space-y-10">
        {demos.map((demo) => (
          <figure key={demo.id}>
            <DemoStage demo={demo} />
            <figcaption className="mt-3">
              <h3 className="font-semibold text-main-text">{t.demos.items[demo.id].title}</h3>
              <p className="text-sm text-second-text">{t.demos.items[demo.id].caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export type InlineVisualProps = { href: string };

/** The small, unlabelled visual PORT-054/PORT-055 place near a project's
 * Context section — no "Démo" heading, no numbering, no figcaption title
 * (only the demo's own caption, smaller, for accessibility). Renders
 * nothing if the project has no "inline"-placement demo, or none is ready. */
export function InlineVisual({ href }: InlineVisualProps) {
  const gate = useDesktopMotionGate();
  const { theme } = useTheme();
  const t = useTranslation();
  const demo = (DEMOS[href] ?? []).find((d) => d.ready && d.placement === "inline");
  if (!demo) return null;

  if (demo.kind === "2d") {
    return (
      <div className="mt-6">
        <demo.Component />
        <p className="mt-2 text-xs text-second-text">{t.demos.items[demo.id].caption}</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className={`relative overflow-hidden rounded-2xl border border-second bg-surface ${demo.inlineClassName ?? "mx-auto aspect-square w-full max-w-xs"}`}>
        {gate === "render" && <demo.Component key={theme} />}
      </div>
      {gate === "render" && (
        <p className="mt-2 text-xs text-second-text">{t.demos.items[demo.id].caption}</p>
      )}
    </div>
  );
}
