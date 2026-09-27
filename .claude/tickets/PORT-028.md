---
id: PORT-028
title: "En-tête commun SiteHeader — nav en ancres, bouton langue globe + code, bascule thème lune/soleil"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
resumeAt: null
priority: P1
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-028-site-header
depends_on: [PORT-024, PORT-025, PORT-026]
parallel_safe: true
human_checkpoint: "Changer de langue et de thème depuis la home ET depuis une page projet ; juger l'aspect du bouton langue."
created: 2026-09-27
---

# En-tête commun `SiteHeader`

**Procédure** : `docs/PROCEDURE-TICKET.md`. Modèle **Sonnet** (mise en page
responsive à juger à l'œil, gestion clavier du menu).

## Retours de Corentin (#2, #4)

> Le menu pour changer de langue est à revoir. Pas d'animation pour l'instant
> dans la transition français / anglais, le menu n'est pas uniforme (avoir
> quelque chose de plus professionnel et invariant entre le « FR » et « EN »).

> … un panel pour changer le thème (avec un menu avec des icônes lune / soleil).

Décisions prises avec lui : **un seul en-tête** pour la home et toutes les
pages projet ; langue = **bouton icône globe + code** (largeur fixe) ouvrant
un petit menu « Français / English » ; thème = bouton lune/soleil.

## Conséquences techniques

- `navbar.jsx` disparaît (il ne sert qu'à `page.tsx` et, pour
  `LanguageToggle`, à `ProjectPage.tsx`).
- La nav passe en **ancres natives** (`#journey`…) : le scroll fluide vient de
  `scroll-behavior: smooth` et le décalage sous l'en-tête de
  `scroll-margin-top` (PORT-025). Le « scroll cassé » de PORT-022 était un
  faux positif.
- « Profil » pointe sur `#home` (la section `#profile` sera fusionnée dans le
  hero par PORT-037).

## Fichiers

- Créé : `src/components/SiteHeader.tsx`
- Modifiés : `src/app/page.tsx`, `src/components/ProjectPage.tsx`,
  `src/i18n/namespaces/header.ts`, `src/i18n/namespaces/navbar.ts`
- Supprimé : `src/components/navbar.jsx`

## Étapes

### 1. Textes — `src/i18n/namespaces/header.ts` (remplacer tout le fichier)

```ts
export interface HeaderDict {
  homeLink: string;
  mainNavLabel: string;
  languageButtonLabel: string;
  /** Each language's name written in that language: identical in fr and en. */
  languageNames: { fr: string; en: string };
  themeToLight: string;
  themeToDark: string;
}

export const headerFr: HeaderDict = {
  homeLink: "Accueil",
  mainNavLabel: "Navigation principale",
  languageButtonLabel: "Changer de langue",
  languageNames: { fr: "Français", en: "English" },
  themeToLight: "Passer au thème clair",
  themeToDark: "Passer au thème sombre",
};

export const headerEn: HeaderDict = {
  homeLink: "Home",
  mainNavLabel: "Main navigation",
  languageButtonLabel: "Change language",
  languageNames: { fr: "Français", en: "English" },
  themeToLight: "Switch to light theme",
  themeToDark: "Switch to dark theme",
};
```

`src/i18n/namespaces/navbar.ts` : supprimer la clé `languageGroupLabel`
(interface + FR + EN) — elle ne servait qu'à `LanguageToggle`. Garder
`experiences`.

### 2. Composant — `src/components/SiteHeader.tsx`

```tsx
"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
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

  const renderLink = (id: NavSectionId, className: string, children: React.ReactNode) =>
    variant === "home" ? (
      <a href={`#${id}`} data-nav-id={id} className={className}>
        {children}
      </a>
    ) : (
      <Link href={`/#${id}`} data-nav-id={id} className={className}>
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
            <span aria-label={t.header.homeLink}>Corentin Bunaux</span>,
          )}
        </div>

        <nav
          aria-label={t.header.mainNavLabel}
          className="col-span-2 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1"
        >
          <ul className="flex justify-between gap-2 text-sm md:justify-center md:gap-8 md:text-base">
            {NAV_SECTION_IDS.map((id) => (
              <li key={id}>
                {renderLink(id, "relative inline-block py-1 text-main-text hover:text-my-green", labels[id])}
              </li>
            ))}
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
```

Notes :
- `data-nav-id` sert au soulignement de PORT-034 : le garder.
- Si `aria-label` sur le `<span>` du nom déclenche un avertissement lint
  (a11y), mettre plutôt `aria-label={t.header.homeLink}` sur le lien : ajouter
  pour cela un 4ᵉ paramètre optionnel `ariaLabel` à `renderLink`.
- `import React` n'est pas nécessaire pour le type `React.ReactNode` avec le
  JSX runtime automatique ; si tsc se plaint, importer
  `type ReactNode` depuis `"react"` et l'utiliser.

### 3. Home — `src/app/page.tsx`

- Supprimer `import Navbar from "../components/navbar";` et la ligne
  `<Navbar allTops={allTops} />`.
- Ajouter `import { SiteHeader } from "../components/SiteHeader";` et, à la
  place de `<Navbar …/>`, `<SiteHeader variant="home" />`.
- **Ne pas** toucher au reste (`allTops` sert encore au hero et au profil ;
  PORT-037 le nettoiera).

### 4. Pages projet — `src/components/ProjectPage.tsx`

- Supprimer `import { LanguageToggle } from "./navbar";` et la ligne
  `<LanguageToggle />` du fil d'Ariane.
- Ajouter `import { SiteHeader } from "./SiteHeader";`.
- Envelopper le retour dans un fragment : `<>` `<SiteHeader variant="project" />`
  `<main …>…</main>` `</>`.
- Sur `<main>`, remplacer `py-8` par
  `pb-8 pt-[calc(var(--header-height)+2rem)]`.
- Dans le fil d'Ariane, corriger le lien `href="/#section-portfolio"` en
  `href="/#portfolio"` (l'ancre `section-portfolio` n'existe pas).
- Le `<nav>` du fil d'Ariane garde ses classes ; `justify-between` n'a plus
  d'effet, le retirer.

### 5. Supprimer `src/components/navbar.jsx`

`git rm src/components/navbar.jsx` puis
`grep -rn "navbar\"\|navbar'\|LanguageToggle" src` → ne doit renvoyer aucun
import (le namespace `t.navbar` reste, c'est normal).

### 6. Vérifications

Procédure §4, puis au navigateur (thème sombre ET clair, 1280 px ET 360 px) :

1. Home : l'en-tête est visible, une ligne à 1280 px, deux lignes à 360 px
   (nom + boutons, puis les 4 liens), sans débordement horizontal.
2. Cliquer chaque lien : la page défile (en douceur, onglet au premier plan)
   jusqu'à la section, et le titre de la section n'est pas caché sous
   l'en-tête.
3. Bouton langue : la largeur du bouton est **la même** en FR et en EN
   (mesurer : `document.querySelector('[aria-controls]').offsetWidth` dans
   les deux langues, noter les deux valeurs dans le journal). Le menu s'ouvre,
   se ferme avec Échap (le focus revient sur le bouton), avec un clic
   extérieur, et après un choix. Tout le site change de langue sans
   animation.
4. Bouton thème : bascule clair/sombre, l'icône change (lune en sombre,
   soleil en clair), le choix survit à un rechargement.
5. Clavier seul : Tab atteint nom, 4 liens, bouton langue, les 2 choix du
   menu ouvert, bouton thème ; le focus est visible partout.
6. `/internships/safran` : même en-tête ; « Projets » ramène à la section
   projets de la home ; le fil d'Ariane n'est pas caché sous l'en-tête.

Commits (deux) :
1. `feat(header): add a shared SiteHeader with language and theme controls`
2. `refactor(nav): replace navbar.jsx with SiteHeader on home and project pages`

## Critères d'acceptation

- [ ] Même en-tête sur la home et sur les 12 pages projet.
- [ ] Bouton langue de largeur identique en FR/EN, menu accessible au clavier.
- [ ] Bascule de thème fonctionnelle et mémorisée.
- [ ] Liens de nav = ancres natives, arrivée sous l'en-tête.
- [ ] `navbar.jsx` supprimé, aucune référence restante.
- [ ] lint / tsc / build passent.

## Hors périmètre

Le soulignement de la section courante (PORT-034). La refonte du hero
(PORT-037). L'alignement de « En bref » (PORT-035).

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

- ARCHITECTURE.md : remplacer `navbar` par `SiteHeader.tsx` dans la carte ;
  invariant « nav = ancres natives `#home/#journey/#portfolio/#about`,
  `scroll-margin-top: var(--header-height)` » ; décision « LanguageToggle
  dupliqué » → remplacée par « un seul SiteHeader (variant home/project) ».
