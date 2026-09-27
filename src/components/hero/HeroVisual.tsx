"use client";

import { OptimizedImage } from "../optimizedImage";
import { useTranslation } from "../../i18n/dictionary";

/**
 * Right-hand panel of the hero (mockup zone ①): the avatar in a circle.
 * PORT-044 adds the 3D globe next to it, in this file only.
 */
export function HeroVisual() {
  const t = useTranslation();
  return (
    <div className="relative mx-auto flex aspect-[4/3] w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-second bg-surface lg:max-w-none">
      <div className="aspect-square w-2/5 overflow-hidden rounded-full border-2 border-my-green bg-surface-raised">
        <OptimizedImage
          src="/img/avatar"
          alt={t.hero.avatarAlt}
          priority
          sizes="(min-width: 1024px) 20vw, 40vw"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    </div>
  );
}
