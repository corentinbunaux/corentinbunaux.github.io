"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, Globe, Moon, Sun } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { useTranslation } from "../i18n/dictionary";
import type { Language } from "../i18n/types";
import { useTheme } from "../theme/ThemeContext";

/** Home-page sections the nav links to, in display order. */
export const NAV_SECTION_IDS = ["home", "journey", "portfolio", "about"] as const;
export type NavSectionId = (typeof NAV_SECTION_IDS)[number];

const LANGUAGES: readonly Language[] = ["fr", "en"];

const CONTROL_CLASS =
  "flex h-9 items-center justify-center rounded-full border border-second bg-surface text-main-text hover:bg-surface-raised";

/**
 * Which home section is currently in the middle band of the viewport.
 * The band (45%-50% from the top) is thin on purpose: exactly one section
 * crosses it at a time, and the previous value is kept while none does.
 */
function useActiveSection(enabled: boolean): NavSectionId | null {
  const [active, setActive] = useState<NavSectionId | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const elements = NAV_SECTION_IDS.map((id) => document.getElementById(id));
    const missing = NAV_SECTION_IDS.filter((_, index) => elements[index] === null);
    if (missing.length > 0) {
      throw new Error(`SiteHeader: missing section(s) #${missing.join(", #")} on the home page.`);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as NavSectionId);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const element of elements) observer.observe(element as HTMLElement);
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}

function LanguageMenu() {
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (next: Language) => {
    setLanguage(next);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${t.header.languageButtonLabel} (${t.header.languageNames[language]})`}
        onClick={() => setOpen((value) => !value)}
        className={`${CONTROL_CLASS} gap-1.5 px-3 text-sm`}
      >
        <Globe aria-hidden="true" className="h-4 w-4" />
        {/* Fixed width + tabular digits: "FR" and "EN" occupy exactly the same box. */}
        <span className="inline-block w-[2.5ch] text-center font-medium uppercase tabular-nums">
          {language}
        </span>
      </button>
      {open && (
        <ul
          id={listId}
          className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-lg border border-second bg-surface-raised py-1 shadow-lg"
        >
          {LANGUAGES.map((code) => (
            <li key={code}>
              <button
                type="button"
                lang={code}
                aria-pressed={code === language}
                onClick={() => choose(code)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-main-text hover:bg-surface"
              >
                {t.header.languageNames[code]}
                {code === language && (
                  <Check aria-hidden="true" className="h-4 w-4 text-my-green" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslation();
  const label = theme === "dark" ? t.header.themeToLight : t.header.themeToDark;
  // The icon shows the theme currently applied (moon = dark, sun = light).
  const Icon = theme === "dark" ? Moon : Sun;
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`${CONTROL_CLASS} w-9`}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}

export type SiteHeaderProps = {
  /** "home": links are same-page anchors. "project": links go back to the home page. */
  variant: "home" | "project";
};

export function SiteHeader({ variant }: SiteHeaderProps) {
  const t = useTranslation();
  const labels: Record<NavSectionId, string> = {
    home: t.common.profile,
    journey: t.navbar.experiences,
    portfolio: t.common.projects,
    about: t.common.about,
  };

  const spiedSection = useActiveSection(variant === "home");
  const activeId: NavSectionId | null = variant === "project" ? "portfolio" : spiedSection;

  const renderLink = (
    id: NavSectionId,
    className: string,
    children: ReactNode,
    ariaLabel?: string,
    ariaCurrent?: "location",
  ) =>
    variant === "home" ? (
      <a href={`#${id}`} data-nav-id={id} className={className} aria-label={ariaLabel} aria-current={ariaCurrent}>
        {children}
      </a>
    ) : (
      <Link href={`/#${id}`} data-nav-id={id} className={className} aria-label={ariaLabel} aria-current={ariaCurrent}>
        {children}
      </Link>
    );

  return (
    <header
      className="fixed inset-x-0 top-0 z-[100] border-b border-second backdrop-blur"
      style={{
        height: "var(--header-height)",
        backgroundColor: "color-mix(in srgb, var(--main) 85%, transparent)",
      }}
    >
      <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto] grid-rows-2 items-center gap-x-4 px-4 sm:px-8 md:grid-cols-[auto_1fr_auto] md:grid-rows-1">
        <div className="col-start-1 row-start-1">
          {renderLink(
            "home",
            "font-semibold text-main-text hover:text-my-green",
            "Corentin Bunaux",
            t.header.homeLink,
          )}
        </div>

        <nav
          aria-label={t.header.mainNavLabel}
          className="col-span-2 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1"
        >
          <ul className="flex justify-between gap-2 text-sm md:justify-center md:gap-8 md:text-base">
            {NAV_SECTION_IDS.map((id) => {
              const isActive = id === activeId;
              return (
                <li key={id}>
                  {renderLink(
                    id,
                    `relative inline-block py-1 hover:text-my-green after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-my-green after:transition-transform after:duration-300 motion-reduce:after:transition-none ${
                      isActive ? "text-my-green after:scale-x-100" : "text-main-text after:scale-x-0"
                    }`,
                    labels[id],
                    undefined,
                    isActive ? "location" : undefined,
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="col-start-2 row-start-1 flex items-center gap-2 md:col-start-3">
          <LanguageMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
