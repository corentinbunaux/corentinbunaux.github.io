"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { THEME_STORAGE_KEY } from "./themeScript";

export type Theme = "light" | "dark";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    // Storage unavailable: behave as "no explicit choice" (system preference).
    return null;
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

/**
 * The inline script in layout.tsx has already set <html data-theme> before
 * hydration. This provider mirrors that value into React state after mount
 * (the server cannot know it), follows live system changes while the visitor
 * has not chosen explicitly, and persists an explicit choice.
 *
 * Initial state is always "dark" (matching the static export's server-only
 * render, which has no `document`) and corrected one effect tick later —
 * never computed from `document` at init time. A PORT-068 review attempt to
 * read the real theme synchronously here, to avoid that one-frame flash,
 * caused a production hydration mismatch (React error #418, caught by
 * Playwright's console-error fixture): the server-rendered HTML always
 * assumes "dark", so a client-side initial render that computes a different
 * value immediately disagrees with it. LanguageContext.tsx accepts the same
 * trade-off for the same reason — see its comment. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");

    const media = window.matchMedia(LIGHT_QUERY);
    const onSystemChange = () => {
      if (readStoredTheme() !== null) return; // an explicit choice wins
      const next: Theme = media.matches ? "light" : "dark";
      applyTheme(next);
      setTheme(next);
    };
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Not persisted (private mode): the choice still applies to this page view.
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme() must be used inside <ThemeProvider>.");
  return ctx;
}
