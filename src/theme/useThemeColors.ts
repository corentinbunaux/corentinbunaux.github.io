"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeContext";

/** Resolved token values, for code that cannot use CSS (three.js materials). */
export interface ThemeColors {
  main: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  mainText: string;
  secondText: string;
  green: string;
  blue: string;
}

const TOKENS: Record<keyof ThemeColors, string> = {
  main: "--main",
  surface: "--surface",
  surfaceRaised: "--surface-raised",
  border: "--border",
  mainText: "--main-text",
  secondText: "--second-text",
  green: "--my-green",
  blue: "--my-blue",
};

/** Reads the tokens currently applied to <html>. Throws if one is missing:
 * a silently black material would hide the bug. */
export function readThemeColors(): ThemeColors {
  const style = getComputedStyle(document.documentElement);
  const entries = Object.entries(TOKENS).map(([key, token]) => {
    const value = style.getPropertyValue(token).trim();
    if (!value) throw new Error(`Design token ${token} is not defined.`);
    return [key, value] as const;
  });
  return Object.fromEntries(entries) as unknown as ThemeColors;
}

/** Current token values, re-read on every theme change. `null` before mount. */
export function useThemeColors(): ThemeColors | null {
  const { theme } = useTheme();
  const [colors, setColors] = useState<ThemeColors | null>(null);
  useEffect(() => {
    // `readThemeColors()` reads getComputedStyle, which needs a DOM that
    // doesn't exist during the static export's server-only render, so this
    // can't be a lazy useState initializer (would return null forever) or a
    // value computed during render (no `document` to read there either on
    // first render) — it has to be a real effect, deliberately re-run on
    // every theme change, not a one-time derived-state anti-pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColors(readThemeColors());
  }, [theme]);
  return colors;
}
