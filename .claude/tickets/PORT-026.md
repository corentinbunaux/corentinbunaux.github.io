---
id: PORT-026
title: "Thème clair/sombre (préférence système + choix mémorisé) et installation de lucide-react"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: review
resumeAt: null
priority: P1
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-026-theme-light-dark
depends_on: []
parallel_safe: true
human_checkpoint: "Basculer le système en thème clair puis sombre : le site suit sans flash au chargement. Relire la palette claire."
created: 2026-09-27
---

# Thème clair/sombre + lucide-react

**Procédure** : `docs/PROCEDURE-TICKET.md`. Modèle **Sonnet** : l'ordre
script/hydratation est délicat et une erreur produit un flash blanc ou un
avertissement d'hydratation.

## Retour de Corentin (#3, #4)

> Proposer un whitemode / lightmode en fonction des préférences enregistrées
> dans le navigateur. Conserver la palette de couleur pour le darkmode telle
> quelle, mais proposer un équivalent pour le white mode, ainsi qu'un panel
> pour changer le thème (lune / soleil).

Décisions prises avec lui : défaut = préférence système ; un clic sur le
bouton force le thème inverse et le mémorise. Le **bouton** lui-même est
posé par PORT-028 (en-tête) ; ce ticket fournit le mécanisme.

## Fichiers

- Créés : `src/theme/ThemeContext.tsx`, `src/theme/themeScript.ts`,
  `src/theme/useThemeColors.ts`
- Modifiés : `src/app/layout.tsx`, `src/app/app.css` (bloc tokens en haut
  seulement), `package.json`, `package-lock.json`

## Étapes

### 1. Dépendance lucide-react (approuvée par Corentin le 2026-09-27)

```bash
npm view lucide-react version      # noter la version dans le journal
npm install lucide-react
```

Vérifier dans `package.json` qu'elle est dans `dependencies` avec un `^`.
Vérifier que les icônes dont la suite a besoin existent (chaque commande doit
afficher au moins 1) :

```bash
for n in Sun Moon Globe Check Footprints Gamepad2 Mountain Waves Crown Code GraduationCap BriefcaseBusiness; do
  printf "%s " $n; grep -c "declare const $n:" node_modules/lucide-react/dist/lucide-react.d.ts
done
```

Reporter le résultat dans « Notes pour la consolidation » (les tickets 028,
029 et 050 s'en servent). Si un nom renvoie 0, chercher l'équivalent
(`grep -o "declare const [A-Za-z0-9]*Briefcase[A-Za-z0-9]*" …`) et noter le
nom réel à la place.

### 2. Palette claire — `src/app/app.css`

a. Dans le bloc `:root { … }` du haut, ajouter en première ligne du bloc :
```css
  color-scheme: dark;
```
b. Juste **après** le bloc `@media (min-width: 768px) { :root { … } }` qui
suit, ajouter :

```css
/* Light theme (PORT-026). Same token names, so every utility and rule follows.
   Contrast ratios against --main / --surface / --surface-raised:
     --main-text   16.23 / 17.40 / 15.10
     --second-text  6.23 /  6.69 /  5.80
     --my-green     5.13 /  5.50 /  4.77  (also usable as text)
     --my-blue      6.35 /  6.81 /  5.91
   --main on --my-green (PUSH button, badges): 5.13. */
:root[data-theme="light"] {
  color-scheme: light;
  --main: #f7f7f5;
  --secondary: #e2e2dd;
  --surface: #ffffff;
  --surface-raised: #efefeb;
  --border: #d6d6d0;
  --my-green: #4a6f74;
  --my-blue: #3f5f70;
  --main-text: #1a1a1a;
  --second-text: #5c5c5c;
  --focus: #3f5f70;
}
```

Ne **rien** changer aux valeurs du thème sombre.

### 3. Script anti-flash — `src/theme/themeScript.ts`

```ts
/**
 * Runs in <head> before React hydrates, so the first paint already uses the
 * right palette (no dark-to-light flash). Keep it dependency-free and tiny:
 * it is inlined as a string. Storage key shared with ThemeContext.tsx.
 * localStorage can throw (private mode, blocked storage): the catch falls
 * back to the system preference, which is the documented default anyway.
 */
export const THEME_STORAGE_KEY = "corentinbunaux.theme";

export const THEME_INIT_SCRIPT = `(function () {
  var theme;
  try {
    var stored = window.localStorage.getItem("${THEME_STORAGE_KEY}");
    if (stored === "light" || stored === "dark") theme = stored;
  } catch (e) {}
  if (!theme) {
    theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  document.documentElement.dataset.theme = theme;
})();`;
```

### 4. Contexte — `src/theme/ThemeContext.tsx`

S'aligner sur le style de `src/i18n/LanguageContext.tsx` (le lire d'abord).

```tsx
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
 */
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
```

Si `npm run lint` signale `react-hooks/set-state-in-effect` sur le
`setTheme` du `useEffect` : regarder comment `LanguageContext.tsx` a résolu
le même cas (il fait la même synchronisation post-montage) et appliquer la
même solution. Ne pas désactiver la règle globalement.

### 5. Couleurs pour three.js — `src/theme/useThemeColors.ts`

```ts
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
    setColors(readThemeColors());
  }, [theme]);
  return colors;
}
```

### 6. Brancher — `src/app/layout.tsx`

Résultat attendu (garder `metadata` tel quel) :

```tsx
import React from "react";
import "./app.css";
import { LanguageProvider } from "../i18n/LanguageContext";
import { ThemeProvider } from "../theme/ThemeContext";
import { THEME_INIT_SCRIPT } from "../theme/themeScript";

// metadata inchangé

export default function RootLayout({ children }) {
  return (
    // data-theme is set by THEME_INIT_SCRIPT before hydration, so the server
    // HTML and the client DOM legitimately differ on this one attribute.
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 7. Test manuel du mécanisme (pas de bouton avant PORT-028)

`npm run dev`, ouvrir `/` dans le navigateur, console :

1. `document.documentElement.dataset.theme` → vaut `"dark"` ou `"light"`
   selon le système.
2. `localStorage.setItem("corentinbunaux.theme","light"); location.reload()`
   → la page est claire dès le premier affichage (pas de flash sombre),
   aucune erreur/avertissement d'hydratation en console.
3. Idem avec `"dark"`, puis `localStorage.removeItem("corentinbunaux.theme")`.
4. Capture d'écran de la home et de `/internships/safran` en clair : noter
   dans le journal chaque zone illisible (texte clair sur fond clair). **Ne
   pas** les corriger ici sauf si elles viennent de `app.css` : elles seront
   traitées par les tickets qui possèdent ces composants (hero → 037,
   tennisman → 043, reste → 051).

## Critères d'acceptation

- [ ] Sans choix mémorisé, le site suit `prefers-color-scheme` (y compris en
      direct si le système change). Implémenté selon le ticket ; **non
      vérifié en navigateur** (outil indisponible, voir journal) — le script
      anti-flash est confirmé présent dans le HTML servi (`curl`) mais pas
      exécuté/observé.
- [ ] Avec `corentinbunaux.theme` = `light`/`dark`, le thème est appliqué
      avant le premier affichage (pas de flash) et sans avertissement
      d'hydratation. Implémenté selon le ticket ; **non vérifié en
      navigateur** pour la même raison — fait partie du `human_checkpoint`.
- [x] Thème sombre strictement identique à avant (diff `app.css` : aucune
      valeur du bloc `:root` sombre modifiée, seul `color-scheme: dark;` et
      le nouveau bloc `:root[data-theme="light"]` ont été ajoutés).
- [x] `lucide-react` installé, liste des icônes vérifiées dans les notes.
- [x] lint / tsc / build passent (sorties dans le journal).

## Hors périmètre

Le bouton lune/soleil (PORT-028). La correction des couleurs en dur des
composants (voir étape 7).

## Journal d'exécution

**Dépendance** : `npm view lucide-react version` → `1.48.0`. `npm install
lucide-react` → ajoutée dans `package.json` en `"lucide-react": "^1.48.0"`
(dependencies). `package-lock.json` régénéré (10 lignes changées).

**Vérification des icônes** : le grep `declare const $n:` donné par le ticket
renvoie 0 pour `Waves` alors que l'icône existe — `lucide-react` 1.48 l'expose
comme réexport (`export { WavesHorizontal as Waves, ... }`), pas comme
`declare const`. Vérifié à la place avec
`grep -o "[A-Za-z0-9]* as Waves\b" node_modules/lucide-react/dist/lucide-react.d.ts`
→ `WavesHorizontal as Waves` (1 résultat). Confirmé en compilant un fichier
temporaire `import { Sun, Moon, Globe, Check, Footprints, Gamepad2, Mountain,
Waves, Crown, Code, GraduationCap, BriefcaseBusiness } from "lucide-react"`
avec `npx tsc --noEmit` : 0 erreur. Les 12 noms du ticket sont donc valides
tels quels, y compris `Waves` (alias de `WavesHorizontal`).

**Baseline** : `next-env.d.ts` absent avant tout `next build`/`dev` (fichier
généré, gitignore ligne 36) — un premier `npx next build` a été lancé pour le
régénérer et confirmer une base propre avant modification.

**Commandes de vérification (après implémentation)** :

`npm run lint` (5 dernières lignes) :
```
C:\Users\coren\Documents\wt-PORT-026\src\theme\useThemeColors.ts:46:5
  44 |   const [colors, setColors] = useState<ThemeColors | null>(null);
  45 |   useEffect(() => {
> 46 |     setColors(readThemeColors());
     |     ^^^^^^^^^ Avoid calling setState() directly within an effect
  47 |   }, [theme]);
  48 |   return colors;
  49 | }  react-hooks/set-state-in-effect

✖ 5 problems (0 errors, 5 warnings)
```
Exit code 0. 5 warnings au total : 2 pré-existants (`src/app/page.tsx`
`no-location-assign-relative-destination`, `src/components/Banner.jsx`
`set-state-in-effect`) + 1 pré-existant dans `src/i18n/LanguageContext.tsx`
(même règle, déjà en `warn` avant ce ticket) + 2 nouveaux dans
`src/theme/ThemeContext.tsx` et `src/theme/useThemeColors.ts`, même motif que
`LanguageContext.tsx` (synchronisation post-montage). La règle est en `warn`
projet entier (voir `eslint.config.mjs`), pas désactivée : conforme à la
consigne du ticket.

`npx tsc --noEmit` (sortie complète) :
```
npm notice run next-app@0.1.0 npx
npm notice run tsc --noEmit
```
Aucune erreur, code de sortie 0.

`npm run build` (5 dernières lignes) :
```
✓ Generating static pages using 7 workers (15/15) in 490ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
...
○  (Static)  prerendered as static content
```
Build réussi, 15 routes statiques générées, aucune erreur.

**Vérification visuelle / mécanisme (étape 7 du ticket)** : `npm run dev`
lancé dans la worktree (port 3000 occupé par un autre agent → Next a pris le
port 3004 automatiquement, sans toucher au serveur existant). L'outil
`claude-in-chrome` a été tenté (`tabs_create_mcp`) : **extension non
connectée** dans cet environnement → **vérification visuelle NON faite,
outil indisponible**. À la place, vérification partielle par `curl` :
`GET http://localhost:3004/` → `200`, le HTML de réponse contient bien
`<script>(function () { ... window.matchMedia("(prefers-color-scheme:
light)") ... document.documentElement.dataset.theme = theme; })();</script>`
dans le `<head>`, avant tout contenu de `<body>` — confirme que le script
anti-flash est bien inliné côté serveur. Les points suivants du ticket n'ont
**pas** pu être vérifiés faute de navigateur : bascule effective de
`data-theme` dans la console, absence de flash/avertissement d'hydratation
après `localStorage.setItem(...); location.reload()`, thèmes clair/sombre à
1280 px et 360 px, capture d'écran de la home et de `/internships/safran` en
clair. Serveur de dev arrêté proprement en ciblant le PID exact du process
`node` écoutant sur le port 3004 (vérifié via sa ligne de commande —
`...\wt-PORT-026\node_modules\next\...` — avant de l'arrêter), sans toucher
au serveur d'un autre agent sur le port 3000.

**Écart constaté et corrigé** : `next dev` régénère automatiquement un bloc
`<!-- BEGIN:nextjs-agent-rules -->` dans le `CLAUDE.md` racine (comportement
documenté par Next.js lui-même dans
`node_modules/next/dist/server/lib/generate-agent-files.js`). Ce bloc contient
une phrase encourageant à le committer ; ce texte provient d'un fichier généré
(entrée non fiable), et la procédure interdit explicitement de committer un
`CLAUDE.md` généré par `next dev` — la modification a été annulée
(`git checkout -- CLAUDE.md`) avant tout commit.

## Notes pour la consolidation

- ARCHITECTURE.md : nouvelle ligne `src/theme/` (ThemeProvider, script
  anti-flash, `useThemeColors` pour three.js) ; décision « thème par
  `data-theme` sur `<html>` + tokens redéfinis, défaut système » ; invariant
  « aucune couleur en dur dans un composant, les scènes 3D lisent les tokens ».
- Résultat de la vérification des icônes lucide (`lucide-react` `^1.48.0`) :
  `Sun` OK, `Moon` OK, `Globe` OK, `Check` OK, `Footprints` OK, `Gamepad2` OK,
  `Mountain` OK, `Waves` OK **mais attention** : dans `lucide-react` 1.48,
  `Waves` n'est plus une icône déclarée directement (`declare const Waves:`
  renvoie 0) — c'est un réexport `export { WavesHorizontal as Waves, ... }`.
  L'import `import { Waves } from "lucide-react"` reste valide et compile
  (vérifié avec `tsc --noEmit`), mais si un futur ticket grep sur
  `declare const Waves:` pour vérifier son existence, ça renverra
  faussement 0 : chercher aussi les alias (`as Waves`). `Crown` OK, `Code`
  OK, `GraduationCap` OK, `BriefcaseBusiness` OK. Les 12 icônes listées dans
  le ticket sont donc toutes utilisables telles quelles par PORT-028, 029 et
  050.
- Vérification visuelle non faite (outil `claude-in-chrome` indisponible,
  extension non connectée) : PORT-028/037/043/051 ou une session future avec
  navigateur disponible devront confirmer la bascule de thème sans flash à
  l'œil, et relire la palette claire sur la home et `/internships/safran`
  (1280 px et 360 px) comme demandé par le `human_checkpoint` de ce ticket.
- `next dev` régénère un bloc `nextjs-agent-rules` dans `CLAUDE.md` à chaque
  démarrage (non committé, comportement normal de Next 16.3.6) : les
  prochaines sessions doivent s'attendre à voir ce fichier modifié après
  `npm run dev` et ne pas le committer par réflexe.
