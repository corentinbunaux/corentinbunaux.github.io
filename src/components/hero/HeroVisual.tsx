"use client";

import dynamic from "next/dynamic";
import { OptimizedImage } from "../optimizedImage";
import { useTranslation } from "../../i18n/dictionary";
import { useDesktopMotionGate } from "../useDesktopMotionGate";
import { useTheme } from "../../theme/ThemeContext";

const HeroGlobe = dynamic(() => import("./HeroGlobe").then((m) => m.HeroGlobe), { ssr: false });

/**
 * Right-hand panel of the hero (mockup zone ①): the avatar, large and
 * centered, with (PORT-052) the former wheel's icons orbiting it directly —
 * no separate globe anymore. The 3D layer (`HeroGlobe`) sits absolutely
 * behind the avatar, desktop only, so the ring of icons appears to circle
 * the avatar itself.
 *
 * The avatar is a plain block (not part of a flex pairing with the globe
 * slot as before PORT-052): it is always centered in the square panel, at a
 * fixed size, so it never moves or resizes when the motion gate resolves
 * from `pending` to `render`/`fallback` — the 3D layer is purely an overlay
 * added on top, it does not participate in layout.
 */
export function HeroVisual() {
  const t = useTranslation();
  const gate = useDesktopMotionGate();
  const { theme } = useTheme();
  const showGlobe = gate === "render";

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-second bg-surface lg:max-w-none">
      {showGlobe && (
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <HeroGlobe key={theme} />
        </div>
      )}
      <div className="relative aspect-square w-3/4 shrink-0 overflow-hidden rounded-full border-2 border-my-green bg-surface-raised lg:w-[70%]">
        <OptimizedImage
          src="/img/avatar"
          alt={t.hero.avatarAlt}
          priority
          sizes="(min-width: 1024px) 30vw, 60vw"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    </div>
  );
}
