"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Language } from "./types";

const STORAGE_KEY = "corentinbunaux.language";
const DEFAULT_LANGUAGE: Language = "fr";

interface LanguageContextValue {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value === "fr" || value === "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always render the default on first paint (server + first client render
  // must match, or React logs a hydration mismatch). `localStorage` is read
  // back only after mount, in the effect below, which can cause a one-frame
  // flash from "fr" to a persisted "en" — that trade-off is the accepted
  // pattern for a static-export site with no server-rendered user state.
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLanguage(stored)) {
        setLanguageState(stored);
      }
    } catch {
      // localStorage can throw (private browsing, disabled storage) — the
      // default language is a perfectly valid fallback, not an error to hide;
      // there is nothing actionable to surface to the user here.
    }
  }, []);

  // `<html lang>` is rendered as "fr" by layout.tsx (static export, no
  // server-side user state): keep it in sync with the displayed language so
  // screen readers pronounce English content in English.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Same as above: persistence is best-effort, the in-memory state
      // change above still applies for the rest of the session.
    }
  }, []);

  // Stable identity like ThemeContext's value: useTranslation()/useLanguage()
  // are consumed in ~18 files, so a fresh object every render would hand all
  // of them a new context value (and anything with setLanguage in a
  // dependency array a new callback) on any unrelated provider re-render.
  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
