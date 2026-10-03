/**
 * Shared helpers for component tests. Excluded from coverage (jest.config.mjs).
 *
 * `renderWithProviders` mounts the same provider stack as `src/app/layout.tsx`
 * (ThemeProvider > LanguageProvider). Language and theme are chosen the way a
 * real visit sets them: the persisted language in localStorage (read by
 * LanguageProvider after mount) and `<html data-theme>` (set by the inline
 * theme script before hydration, mirrored by ThemeProvider after mount).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { LanguageProvider } from "../../../src/i18n/LanguageContext";
import { ThemeProvider } from "../../../src/theme/ThemeContext";
import type { Language } from "../../../src/i18n/types";

/** Parsed straight from app.css instead of duplicated by hand, so a colour
 * changed there can't silently go stale here (PORT-068 review). Only
 * hex-colour custom properties are kept — spacing/sizing tokens aren't read
 * by any test. Assumes the flat, single-level `:root { --x: #hex; }` shape
 * app.css's token blocks actually have (no nested rules inside them). */
function parseThemeTokens(css: string, blockPattern: RegExp): Record<string, string> {
  const block = blockPattern.exec(css)?.[1] ?? "";
  const tokens: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]+);/g)) {
    tokens[name] = value;
  }
  return tokens;
}

const APP_CSS = readFileSync(path.join(process.cwd(), "src/app/app.css"), "utf8");

export const DARK_TOKENS: Record<string, string> = parseThemeTokens(APP_CSS, /:root\s*\{([^}]*)\}/);

export const LIGHT_TOKENS: Record<string, string> = parseThemeTokens(
  APP_CSS,
  /:root\[data-theme="light"\]\s*\{([^}]*)\}/,
);

/** Defines the design tokens on <html>, as app.css does in the browser. */
export function installThemeTokens(tokens: Record<string, string>) {
  for (const [name, value] of Object.entries(tokens)) {
    document.documentElement.style.setProperty(name, value);
  }
}

export type ProviderOptions = {
  language?: Language;
  theme?: "light" | "dark";
} & RenderOptions;

export function renderWithProviders(ui: ReactElement, { language = "fr", theme = "dark", ...options }: ProviderOptions = {}) {
  window.localStorage.setItem("corentinbunaux.language", language);
  document.documentElement.dataset.theme = theme;
  installThemeTokens(theme === "light" ? LIGHT_TOKENS : DARK_TOKENS);
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </ThemeProvider>
    ),
    ...options,
  });
}
