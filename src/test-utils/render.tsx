/**
 * Shared helpers for component tests. Excluded from coverage (jest.config.mjs).
 *
 * `renderWithProviders` mounts the same provider stack as `src/app/layout.tsx`
 * (ThemeProvider > LanguageProvider). Language and theme are chosen the way a
 * real visit sets them: the persisted language in localStorage (read by
 * LanguageProvider after mount) and `<html data-theme>` (set by the inline
 * theme script before hydration, mirrored by ThemeProvider after mount).
 */
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { LanguageProvider } from "../i18n/LanguageContext";
import { ThemeProvider } from "../theme/ThemeContext";
import type { Language } from "../i18n/types";

/** Real values from src/app/app.css (dark :root and [data-theme="light"]). */
export const DARK_TOKENS: Record<string, string> = {
  "--main": "#1a1a1a",
  "--surface": "#202020",
  "--surface-raised": "#2a2a2a",
  "--border": "#2f2f2f",
  "--main-text": "#f5f5f5",
  "--second-text": "#999999",
  "--my-green": "#81a3a7",
  "--my-blue": "#a7bcc7",
};

export const LIGHT_TOKENS: Record<string, string> = {
  "--main": "#f7f7f5",
  "--surface": "#ffffff",
  "--surface-raised": "#eef2f4",
  "--border": "#d6d6d0",
  "--main-text": "#1a1a1a",
  "--second-text": "#5c5c5c",
  "--my-green": "#4a6f74",
  "--my-blue": "#3f5f70",
};

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
