---
id: PORT-031
title: "Section « Démo » des pages projet — registre, socle three.js commun, fin de l'accent flottant"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: done
resumeAt: null
priority: P1
estimate: 1
confidence: medium
model: sonnet
branch: feat/PORT-031-demo-section
depends_on: [PORT-024, PORT-026]
parallel_safe: true
human_checkpoint: null
created: 2026-09-27
---

# Section « Démo » + registre + `ThreeStage`

**Procédure** : `docs/PROCEDURE-TICKET.md`. Modèle **Sonnet** : c'est le
socle de 12 tickets (038 à 050), son API doit être exactement celle décrite
ici — les tickets suivants s'appuient dessus sans la relire en détail.

## Pourquoi

Les retours #8 à #13 demandent des animations et des jeux par projet (train,
voiture qui se gare, mâchoire manipulable, démineur…). L'accent 3D actuel
(`ProjectAccent3D`, 160 × 160 px flottant à côté du titre) est trop petit et
gêne le titre. Décision validée par Corentin : une **section « Démo »**
pleine largeur en bas de l'article. 3D = desktop uniquement (même règle que
le hero) ; jeux 2D = partout.

Pour que les tickets de démo tournent **en parallèle sans conflit** : ce
ticket crée le registre avec **toutes** les démos déjà déclarées, un fichier
composant vide par démo, et tous les textes. Chaque ticket de démo remplacera
ensuite **son** fichier et passera **sa** ligne `ready` à `true`.

## Fichiers

- Créés, dans `src/components/demos/` : `demoIds.ts`, `registry.ts`,
  `DemoSection.tsx`, `ThreeStage.tsx`, `SafranEarthDemo.tsx`,
  `QuimesisFragmentsDemo.tsx`, et 9 fichiers vides : `QuimesisJawDemo.tsx`,
  `SncfTrainDemo.tsx`, `SpaceTimeDemo.tsx`, `MinesweeperDemo.tsx`,
  `GuardsDemo.tsx`, `TypingDemo.tsx`, `PredictDemo.tsx`,
  `ParkingCarDemo.tsx`, `ExoArmDemo.tsx`
- Modifiés : `src/components/ProjectPage.tsx`,
  `src/components/SafranAccent.tsx`, `src/components/QuimesisAccent.tsx`
  (couleurs seulement), `src/i18n/namespaces/demos.ts`
- Supprimé : `src/components/ProjectAccent3D.tsx`

## Étapes

### 1. `src/components/demos/demoIds.ts`

```ts
/** Every demo the site knows about. One id = one component in registry.ts
 * and one { title, caption } entry in src/i18n/namespaces/demos.ts. */
export type DemoId =
  | "safran-earth"
  | "quimesis-fragments"
  | "quimesis-jaw"
  | "sncf-train"
  | "sncf-spacetime"
  | "minesweeper"
  | "guards"
  | "typing"
  | "predict"
  | "parking-car"
  | "exo-arm";
```

### 2. Textes — `src/i18n/namespaces/demos.ts` (remplacer tout le fichier)

```ts
import type { DemoId } from "../../components/demos/demoIds";

export interface DemoText {
  title: string;
  caption: string;
}

export interface DemosDict {
  sectionTitle: string;
  desktopOnly: string;
  items: Record<DemoId, DemoText>;
}

export const demosFr: DemosDict = {
  sectionTitle: "Démo",
  desktopOnly:
    "Cette animation 3D s'affiche sur un écran large (1024 px et plus), si votre système ne demande pas de réduire les animations.",
  items: {
    "safran-earth": {
      title: "La Terre et sa constellation",
      caption:
        "Des satellites en orbite autour de la Terre, clin d'œil au secteur aérospatial de Safran.",
    },
    "quimesis-fragments": {
      title: "Mes débuts en 3D",
      caption:
        "C'est pendant ce stage que j'ai découvert l'animation 3D : cette scène en garde la trace.",
    },
    "quimesis-jaw": {
      title: "Mâchoire interactive",
      caption:
        "Faites-la tourner en la faisant glisser, cliquez pour ouvrir ou fermer la mâchoire, survolez une dent pour la mettre en évidence. Modèle simplifié, généré par le code.",
    },
    "sncf-train": {
      title: "Un train sur la ligne",
      caption:
        "Un train parcourt une ligne en boucle : ce sont ces circulations que les graphiques espace-temps représentent.",
    },
    "sncf-spacetime": {
      title: "Graphique espace-temps",
      caption:
        "Chaque trait est un train : le temps en abscisse, les gares en ordonnée. Plus la pente est forte, plus le train est rapide ; un palier est un arrêt. Données fictives.",
    },
    minesweeper: {
      title: "Démineur",
      caption:
        "Grille 9 × 9, 10 mines. Clic : révéler une case. Clic droit, appui long ou mode drapeau : marquer une mine.",
    },
    guards: {
      title: "Projet optimisation : les surveillants",
      caption:
        "Chaque surveillant voit toute sa ligne et toute sa colonne, jusqu'au premier mur. Couvrez toutes les cibles avec le moins de surveillants possible.",
    },
    typing: {
      title: "Dactylo Race — version solo",
      caption:
        "L'original se jouait à plusieurs en réseau (processus et threads en C). Cette version se joue seul, dans le navigateur : tapez la phrase le plus vite possible.",
    },
    predict: {
      title: "Dictionnaire de prédiction",
      caption:
        "Commencez à taper un mot : les suggestions viennent d'un petit dictionnaire classé par fréquence. Tab ou clic pour compléter.",
    },
    "parking-car": {
      title: "Créneau autonome",
      caption:
        "Un robot voiture longe une rangée, détecte une place libre avec son capteur puis s'y gare seul.",
    },
    "exo-arm": {
      title: "Bras d'exosquelette",
      caption:
        "Le moteur au coude assiste le bras : la charge monte, l'effort du porteur reste faible.",
    },
  },
};

export const demosEn: DemosDict = {
  sectionTitle: "Demo",
  desktopOnly:
    "This 3D animation is shown on wide screens (1024 px and up), unless your system asks to reduce motion.",
  items: {
    "safran-earth": {
      title: "Earth and its constellation",
      caption: "Satellites orbiting Earth, a nod to Safran's aerospace sector.",
    },
    "quimesis-fragments": {
      title: "My first steps in 3D",
      caption:
        "This internship is where I discovered 3D animation: this scene is a reminder of it.",
    },
    "quimesis-jaw": {
      title: "Interactive jaw",
      caption:
        "Drag to rotate, click to open or close the jaw, hover a tooth to highlight it. Simplified model, generated in code.",
    },
    "sncf-train": {
      title: "A train on the line",
      caption:
        "A train runs along a looping line: these are the movements that space-time diagrams depict.",
    },
    "sncf-spacetime": {
      title: "Space-time diagram",
      caption:
        "Each line is a train: time on the horizontal axis, stations on the vertical axis. The steeper the slope, the faster the train; a flat segment is a stop. Fictional data.",
    },
    minesweeper: {
      title: "Minesweeper",
      caption:
        "9 × 9 grid, 10 mines. Click: reveal a cell. Right-click, long press or flag mode: mark a mine.",
    },
    guards: {
      title: "Optimisation project: the guards",
      caption:
        "Each guard sees their whole row and column, up to the first wall. Cover every target with as few guards as possible.",
    },
    typing: {
      title: "Dactylo Race — solo version",
      caption:
        "The original was a networked multiplayer game (C processes and threads). This version is single-player, in the browser: type the sentence as fast as you can.",
    },
    predict: {
      title: "Predictive dictionary",
      caption:
        "Start typing a word: suggestions come from a small frequency-ranked dictionary. Tab or click to complete.",
    },
    "parking-car": {
      title: "Self-parking",
      caption:
        "A robot car drives along a row, detects a free spot with its sensor, then parks by itself.",
    },
    "exo-arm": {
      title: "Exoskeleton arm",
      caption:
        "The elbow motor assists the arm: the load goes up while the wearer's effort stays low.",
    },
  },
};
```

### 3. Socle three.js — `src/components/demos/ThreeStage.tsx`

API **contractuelle** (les tickets 044 à 050 l'utilisent telle quelle) :

```tsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { readThemeColors, type ThemeColors } from "../../theme/useThemeColors";

const MAX_PIXEL_RATIO = 2;
/** Clamp for the per-frame delta, so a long pause does not teleport objects. */
const MAX_DELTA_SECONDS = 0.1;

export interface ThreeStageContext {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  /** The element the canvas lives in (for pointer listeners). */
  readonly container: HTMLDivElement;
  /** Design tokens resolved for the current theme (the stage remounts on theme change). */
  readonly colors: ThemeColors;
}

export interface ThreeStageScene {
  /** Called once per rendered frame, in seconds. `elapsed` does not advance
   * while the stage is scrolled out of view (rendering is paused). */
  update(elapsed: number, delta: number): void;
  /** Extra cleanup: event listeners, controls. Geometries, materials and
   * textures reachable from `scene` are disposed by the stage itself. */
  dispose?(): void;
}

/** Builds the scene. Must be a stable reference (module-level function). */
export type ThreeStageSetup = (context: ThreeStageContext) => ThreeStageScene;

export interface ThreeStageProps {
  setup: ThreeStageSetup;
  fov?: number;
  className?: string;
}

/**
 * Shared renderer/camera/loop for every 3D demo (PORT-031): sizes to its
 * container, pauses when off-screen, disposes everything on unmount.
 * Does NOT gate on viewport/reduced motion — DemoSection does that.
 */
export function ThreeStage({ setup, fov = 45, className = "h-full w-full" }: ThreeStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = readThemeColors();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      fov,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      200,
    );
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);

    const stage = setup({ scene, camera, renderer, container, colors });

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let visible = true;
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersectionObserver.observe(container);

    let elapsed = 0;
    let last = performance.now();
    let frameId = 0;
    const loop = (now: number) => {
      frameId = window.requestAnimationFrame(loop);
      const delta = Math.min((now - last) / 1000, MAX_DELTA_SECONDS);
      last = now;
      if (!visible) return;
      elapsed += delta;
      stage.update(elapsed, delta);
      renderer.render(scene, camera);
    };
    frameId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      stage.dispose?.();
      scene.traverse((object) => {
        const { geometry, material } = object as THREE.Mesh;
        geometry?.dispose();
        const materials = Array.isArray(material) ? material : material ? [material] : [];
        for (const item of materials) {
          for (const value of Object.values(item)) {
            if (value instanceof THREE.Texture) value.dispose();
          }
          item.dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [setup, fov]);

  return <div ref={containerRef} className={className} />;
}
```

### 4. Registre — `src/components/demos/registry.ts`

Respecter **exactement** la mise en forme : une entrée sur plusieurs lignes,
une ligne vide et un commentaire `// PORT-0XX` entre deux entrées. C'est ce
qui permet à 11 tickets de modifier chacun sa ligne `ready` sans conflit Git.

```ts
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DemoId } from "./demoIds";

/** "3d": three.js, desktop only (useDesktopMotionGate). "2d": DOM/SVG, everywhere. */
export type DemoKind = "3d" | "2d";

export interface DemoEntry {
  readonly id: DemoId;
  readonly kind: DemoKind;
  /** false = declared but not implemented yet: DemoSection skips it. */
  readonly ready: boolean;
  readonly Component: ComponentType;
}

const SafranEarthDemo = dynamic(() => import("./SafranEarthDemo").then((m) => m.SafranEarthDemo), { ssr: false });
const QuimesisFragmentsDemo = dynamic(() => import("./QuimesisFragmentsDemo").then((m) => m.QuimesisFragmentsDemo), { ssr: false });
const QuimesisJawDemo = dynamic(() => import("./QuimesisJawDemo").then((m) => m.QuimesisJawDemo), { ssr: false });
const SncfTrainDemo = dynamic(() => import("./SncfTrainDemo").then((m) => m.SncfTrainDemo), { ssr: false });
const SpaceTimeDemo = dynamic(() => import("./SpaceTimeDemo").then((m) => m.SpaceTimeDemo), { ssr: false });
const MinesweeperDemo = dynamic(() => import("./MinesweeperDemo").then((m) => m.MinesweeperDemo), { ssr: false });
const GuardsDemo = dynamic(() => import("./GuardsDemo").then((m) => m.GuardsDemo), { ssr: false });
const TypingDemo = dynamic(() => import("./TypingDemo").then((m) => m.TypingDemo), { ssr: false });
const PredictDemo = dynamic(() => import("./PredictDemo").then((m) => m.PredictDemo), { ssr: false });
const ParkingCarDemo = dynamic(() => import("./ParkingCarDemo").then((m) => m.ParkingCarDemo), { ssr: false });
const ExoArmDemo = dynamic(() => import("./ExoArmDemo").then((m) => m.ExoArmDemo), { ssr: false });

/** Project `href` -> its demos, in display order. */
export const DEMOS: Readonly<Record<string, readonly DemoEntry[]>> = {
  "internships/safran": [
    // PORT-045 rewrites SafranEarthDemo.tsx (ready from the start: wraps the old accent)
    {
      id: "safran-earth",
      kind: "3d",
      ready: true,
      Component: SafranEarthDemo,
    },
  ],

  "internships/quimesis": [
    // Kept as-is: Corentin's first 3D animation
    {
      id: "quimesis-fragments",
      kind: "3d",
      ready: true,
      Component: QuimesisFragmentsDemo,
    },

    // PORT-049
    {
      id: "quimesis-jaw",
      kind: "3d",
      ready: false,
      Component: QuimesisJawDemo,
    },
  ],

  "research/sncf": [
    // PORT-046
    {
      id: "sncf-train",
      kind: "3d",
      ready: false,
      Component: SncfTrainDemo,
    },

    // PORT-042
    {
      id: "sncf-spacetime",
      kind: "2d",
      ready: false,
      Component: SpaceTimeDemo,
    },
  ],

  "emse/minesweeper": [
    // PORT-038
    {
      id: "minesweeper",
      kind: "2d",
      ready: false,
      Component: MinesweeperDemo,
    },
  ],

  "emse/programming": [
    // PORT-039
    {
      id: "guards",
      kind: "2d",
      ready: false,
      Component: GuardsDemo,
    },

    // PORT-040
    {
      id: "typing",
      kind: "2d",
      ready: false,
      Component: TypingDemo,
    },

    // PORT-041
    {
      id: "predict",
      kind: "2d",
      ready: false,
      Component: PredictDemo,
    },
  ],

  "emse/embedded": [
    // PORT-047
    {
      id: "parking-car",
      kind: "3d",
      ready: false,
      Component: ParkingCarDemo,
    },
  ],

  "cpge_tipe": [
    // PORT-048
    {
      id: "exo-arm",
      kind: "3d",
      ready: false,
      Component: ExoArmDemo,
    },
  ],
};
```

Si Prettier/ESLint reformate les lignes `dynamic(...)` c'est acceptable ;
**pas** les entrées de `DEMOS` (garder une propriété par ligne). Si ESLint
exige des guillemets autour de `cpge_tipe` ou non, suivre ESLint.

### 5. Fichiers de démo

a. Les 9 fichiers vides, tous sur ce modèle (adapter nom et ticket) :

```tsx
"use client";

/** Placeholder — implemented by PORT-038, which also sets `ready: true` in registry.ts. */
export function MinesweeperDemo() {
  return null;
}
```

| Fichier | Export | Ticket |
| --- | --- | --- |
| `QuimesisJawDemo.tsx` | `QuimesisJawDemo` | PORT-049 |
| `SncfTrainDemo.tsx` | `SncfTrainDemo` | PORT-046 |
| `SpaceTimeDemo.tsx` | `SpaceTimeDemo` | PORT-042 |
| `MinesweeperDemo.tsx` | `MinesweeperDemo` | PORT-038 |
| `GuardsDemo.tsx` | `GuardsDemo` | PORT-039 |
| `TypingDemo.tsx` | `TypingDemo` | PORT-040 |
| `PredictDemo.tsx` | `PredictDemo` | PORT-041 |
| `ParkingCarDemo.tsx` | `ParkingCarDemo` | PORT-047 |
| `ExoArmDemo.tsx` | `ExoArmDemo` | PORT-048 |

b. `SafranEarthDemo.tsx` :

```tsx
"use client";

import { SafranAccent } from "../SafranAccent";

/** Temporary: the PORT-020 accent, until PORT-045 replaces it with the Earth scene. */
export function SafranEarthDemo() {
  return <SafranAccent />;
}
```

c. `QuimesisFragmentsDemo.tsx` : idem avec `QuimesisAccent` (commentaire :
« Corentin's first 3D animation, kept on purpose (feedback #11). »).

d. Couleurs des deux accents (thème clair) : dans `SafranAccent.tsx` et
`QuimesisAccent.tsx`, au début du `useEffect`, ajouter
`const colors = readThemeColors();` (import depuis
`"../theme/useThemeColors"`), puis remplacer chaque `color: 0xa7bcc7` par
`color: new THREE.Color(colors.blue)` et chaque `color: 0x81a3a7` par
`color: new THREE.Color(colors.green)`. Ne rien changer d'autre dans ces
fichiers.

### 6. Section — `src/components/demos/DemoSection.tsx`

```tsx
"use client";

import { useDesktopMotionGate } from "../useDesktopMotionGate";
import { useTranslation } from "../../i18n/dictionary";
import { useTheme } from "../../theme/ThemeContext";
import { DEMOS, type DemoEntry } from "./registry";

function DemoStage({ demo }: { demo: DemoEntry }) {
  const gate = useDesktopMotionGate();
  const { theme } = useTheme();
  const t = useTranslation();
  const { Component } = demo;

  if (demo.kind === "2d") {
    return (
      <div className="rounded-2xl border border-second bg-surface p-4 sm:p-6">
        <Component />
      </div>
    );
  }

  return (
    // Fixed 16:9 box in every gate state: no layout shift when the scene mounts.
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-second bg-surface">
      {gate === "render" && (
        // key={theme}: remount so the scene re-reads the design tokens.
        <Component key={theme} />
      )}
      {gate === "fallback" && (
        <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-second-text">
          {t.demos.desktopOnly}
        </p>
      )}
    </div>
  );
}

export type DemoSectionProps = {
  href: string;
  /** Section number shown above the heading, continuing the article's numbering. */
  number: number;
};

export function DemoSection({ href, number }: DemoSectionProps) {
  const t = useTranslation();
  const demos = (DEMOS[href] ?? []).filter((demo) => demo.ready);
  if (demos.length === 0) return null;

  return (
    <section aria-labelledby="demo-heading">
      <p className="mb-1 text-sm font-semibold tracking-widest text-my-green">
        {String(number).padStart(2, "0")}
      </p>
      <h2 id="demo-heading" className="mb-4 text-xl font-semibold text-main-text">
        {t.demos.sectionTitle}
      </h2>
      <div className="space-y-10">
        {demos.map((demo) => (
          <figure key={demo.id}>
            <DemoStage demo={demo} />
            <figcaption className="mt-3">
              <h3 className="font-semibold text-main-text">{t.demos.items[demo.id].title}</h3>
              <p className="text-sm text-second-text">{t.demos.items[demo.id].caption}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
```

### 7. `src/components/ProjectPage.tsx`

- Supprimer `import { ProjectAccent3D } from "./ProjectAccent3D";` et la
  ligne `<ProjectAccent3D href={project.href} />`.
- Ajouter `import { DemoSection } from "./demos/DemoSection";`.
- Dans `<div className="space-y-10">`, **entre** la fin du
  `project.pageContent.mainPart.map(...)` et le bloc
  `{project.photos.length > 0 && (` de la galerie, insérer :
  ```tsx
            <DemoSection
              href={project.href}
              number={project.pageContent.mainPart.length + 2}
            />
  ```
- `git rm src/components/ProjectAccent3D.tsx` ; `grep -rn ProjectAccent3D src`
  ne renvoie plus rien.

### 8. Vérifications

Procédure §4, puis au navigateur à 1280 px :

1. `/internships/safran` : plus d'accent à côté du titre ; en bas de l'article,
   section numérotée « Démo » avec l'animation de satellites dans un cadre
   16:9, titre + légende dessous.
2. `/internships/quimesis` : une seule démo (les fragments) ; la mâchoire
   (`ready: false`) n'apparaît pas.
3. `/research/sncf`, `/emse/programming` : **aucune** section Démo (tout est
   `ready: false`).
4. À 360 px sur Safran : le cadre 16:9 affiche le message « Cette animation
   3D s'affiche sur un écran large… », sans chargement de three.js (onglet
   Réseau : pas de chunk three).
5. Basculer le thème sur Safran : la scène se recrée avec les couleurs du
   thème clair.
6. Quitter la page (lien projet suivant) puis revenir : aucune erreur console
   (« WebGL context » ou fuite).

Commits :
1. `feat(demos): add the demo registry, DemoSection and the ThreeStage helper`
2. `refactor(project-page): replace the floating 3D accent with DemoSection`

## Critères d'acceptation

- [x] API `ThreeStage` / `DEMOS` / `DemoId` conforme à ce ticket.
- [x] 11 démos déclarées, 2 prêtes (Safran, fragments Quimesis).
- [x] Section Démo numérotée à la suite de l'article, absente s'il n'y a rien.
- [x] 3D : message sur mobile/réduction des animations, pas de chunk chargé.
- [x] `ProjectAccent3D.tsx` supprimé.
- [x] lint / tsc / build passent.

## Journal d'exécution

2026-09-27 — worktree `../wt-PORT-031` depuis `refonte-2026` (ca11ec0), `npm ci` OK.
Dépendances PORT-024 (6a33ed2) et PORT-026 (ca11ec0) fusionnées.

Étapes 1 à 7 appliquées telles quelles (blocs de code du ticket repris à
l'identique ; `registry.ts` non reformaté par ESLint, une propriété par ligne
conservée ; `cpge_tipe` laissé entre guillemets, ESLint ne dit rien).
`grep -rn ProjectAccent3D src` : aucun résultat. `grep -n "Ã\|â€"` sur les
fichiers créés : aucun résultat.

`npm run lint` (5 warnings, tous préexistants : page.tsx, Banner.jsx,
LanguageContext.tsx, ThemeContext.tsx, useThemeColors.ts — aucun dans
`src/components/demos/`) :
```
  47 |   }, [theme]);
  48 |   return colors;
  49 | }  react-hooks/set-state-in-effect

✖ 5 problems (0 errors, 5 warnings)
```
`npm run build` :
```
├ ○ /research/sncf
└ ○ /work/gcii


○  (Static)  prerendered as static content
```
`npx tsc --noEmit` (après le build) : sortie vide, exit 0.

Vérification visuelle NON faite, outil indisponible (extension
claude-in-chrome non connectée). À la place, `npm run dev` de la worktree
(port 3001) + `curl` du HTML prérendu :
- `/internships/safran` : `<h2 id="demo-heading">Démo</h2>`, numéros de
  section 01…05 (Démo = 05), 1 `<figure>` dans un cadre `aspect-video`, titre
  « La Terre et sa constellation » ; plus de `float-right mb-4 ml-6` (accent
  flottant) ; aucun `<script src>` contenant « three » dans le HTML initial.
- `/internships/quimesis` : section Démo, 1 seule figure (« Mes débuts en 3D ») ;
  la mâchoire n'apparaît pas.
- `/research/sncf`, `/emse/programming` : aucune section Démo.
Non vérifié (navigateur requis) : rendu effectif de la scène WebGL, message
desktopOnly à 360 px et absence de chunk three dans l'onglet Réseau, recréation
de la scène au changement de thème, absence d'erreur console en quittant la page.

Écarts : aucun par rapport au code du ticket.

## Notes pour la consolidation

- ARCHITECTURE.md : remplacer la ligne `ProjectAccent3D` par
  `src/components/demos/` (registre `DEMOS` par `href`, `DemoSection`,
  `ThreeStage` = socle three.js commun : resize, pause hors écran, dispose,
  couleurs du thème) ; invariant « une démo = un id dans `demoIds.ts` + une
  entrée dans `registry.ts` + un texte dans `namespaces/demos.ts` ».
- `ThreeStage.tsx` n'est encore utilisé par aucune démo (Safran/Quimesis
  enveloppent les anciens accents) : premier usage attendu en PORT-045.
- Les critères 4 à 6 (360 px, changement de thème, console) n'ont pas pu être
  vérifiés au navigateur : à contrôler lors de la recette.
