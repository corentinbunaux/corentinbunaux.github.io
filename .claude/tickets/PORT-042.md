---
id: PORT-042
title: "Démo — graphique espace-temps SNCF animé (SVG, données fictives)"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: review
resumeAt: null
priority: P2
estimate: 0.5
confidence: high
model: haiku
branch: feat/PORT-042-spacetime-demo
depends_on: [PORT-031]
parallel_safe: true
human_checkpoint: "Vérifier que le graphique ressemble à ce que la SNCF appelle un graphique espace-temps."
created: 2026-09-27
---

# Démo — graphique espace-temps

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Pourquoi

Retour #8 : une animation pour la SNCF. Le projet portait sur la
**lisibilité des graphiques espace-temps** (temps en abscisse, gares en
ordonnée, un trait par train). Corentin a choisi « les deux » : un train 3D
(PORT-046) **et** ce graphique, qui explique le sujet. Données **fictives**
(gares A à F), c'est écrit dans la légende (PORT-031).

Rendu : SVG responsive ; un curseur vertical « maintenant » balaie 2 heures
en 12 s, chaque train se dessine au fur et à mesure avec un point à sa
position courante ; pause de 2 s puis ça recommence. Avec « réduire les
animations », le graphique complet s'affiche sans animation. Fonctionne sur
mobile (démo « 2d »).

## Fichiers (uniquement ceux-ci)

- Remplacé : `src/components/demos/SpaceTimeDemo.tsx`
- Modifiés : `src/i18n/namespaces/demos.ts` (ajout d'un sous-objet
  `spaceTime`), `registry.ts` (ligne `ready` de `sncf-spacetime`)

## Étapes

### 1. Textes — `src/i18n/namespaces/demos.ts`

Ajouter à l'interface `DemosDict` (après `items`) :

```ts
  spaceTime: {
    chartLabel: string;
    timeAxis: string;
    stopping: string;
    nonStop: string;
  };
```

Et dans `demosFr` (après `items: {…},`) :

```ts
  spaceTime: {
    chartLabel:
      "Graphique espace-temps fictif : cinq trains entre les gares A et F sur deux heures.",
    timeAxis: "min",
    stopping: "Omnibus (arrêts en gare)",
    nonStop: "Direct",
  },
```

Dans `demosEn` :

```ts
  spaceTime: {
    chartLabel:
      "Fictional space-time diagram: five trains between stations A and F over two hours.",
    timeAxis: "min",
    stopping: "Stopping service",
    nonStop: "Non-stop",
  },
```

Ne rien modifier d'autre dans ce fichier.

### 2. Composant — `src/components/demos/SpaceTimeDemo.tsx` (remplacer tout le fichier)

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "../../i18n/dictionary";

/** Fictional line: station name and distance from A in km. */
const STATIONS = [
  { name: "A", km: 0 },
  { name: "B", km: 18 },
  { name: "C", km: 35 },
  { name: "D", km: 60 },
  { name: "E", km: 78 },
  { name: "F", km: 100 },
] as const;

type Point = readonly [minutes: number, stationIndex: number];

/** Each train: [time, station] points; two consecutive points at the same station are a stop. */
const TRAINS: readonly { id: string; stopping: boolean; points: readonly Point[] }[] = [
  { id: "1", stopping: true, points: [[0, 0], [14, 1], [16, 1], [29, 2], [31, 2], [50, 3], [52, 3], [65, 4], [67, 4], [84, 5]] },
  { id: "2", stopping: false, points: [[20, 0], [70, 5]] },
  { id: "3", stopping: true, points: [[10, 5], [40, 3], [42, 3], [72, 1], [74, 1], [90, 0]] },
  { id: "4", stopping: true, points: [[45, 0], [59, 1], [61, 1], [74, 2], [76, 2], [95, 3], [97, 3], [110, 4], [112, 4], [118, 5]] },
  { id: "5", stopping: false, points: [[60, 5], [108, 0]] },
];

const DURATION_MIN = 120;
const SWEEP_MS = 12000;
const HOLD_MS = 2000;

const W = 640;
const H = 360;
const LEFT = 48;
const RIGHT = 16;
const TOP = 16;
const BOTTOM = 40;

const x = (minutes: number) => LEFT + (minutes / DURATION_MIN) * (W - LEFT - RIGHT);
const y = (stationIndex: number) => TOP + (STATIONS[stationIndex].km / 100) * (H - TOP - BOTTOM);

/** The part of a train's path up to `now`, plus its current position if it is running. */
function clip(points: readonly Point[], now: number): { path: [number, number][]; head: [number, number] | null } {
  const path: [number, number][] = [];
  for (let i = 0; i < points.length; i++) {
    const [t, s] = points[i];
    if (t <= now) {
      path.push([x(t), y(s)]);
      continue;
    }
    if (i > 0) {
      const [t0, s0] = points[i - 1];
      const ratio = (now - t0) / (t - t0);
      const head: [number, number] = [x(now), y(s0) + (y(s) - y(s0)) * ratio];
      path.push(head);
      return { path, head };
    }
    return { path, head: null };
  }
  return { path, head: null };
}

function useSweep(): number {
  const [now, setNow] = useState(DURATION_MIN);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (time: number) => {
      const cycle = (time - start) % (SWEEP_MS + HOLD_MS);
      setNow(Math.min(cycle / SWEEP_MS, 1) * DURATION_MIN);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return now;
}

export function SpaceTimeDemo() {
  const t = useTranslation();
  const now = useSweep();
  const colors = ["var(--my-green)", "var(--my-blue)"];

  return (
    <figure className="mx-auto max-w-3xl">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.demos.spaceTime.chartLabel} className="h-auto w-full">
        {STATIONS.map((station, i) => (
          <g key={station.name}>
            <line x1={LEFT} x2={W - RIGHT} y1={y(i)} y2={y(i)} stroke="var(--border)" strokeWidth={1} />
            <text x={LEFT - 12} y={y(i) + 4} textAnchor="end" fontSize={13} fill="var(--second-text)">
              {station.name}
            </text>
          </g>
        ))}
        {[0, 20, 40, 60, 80, 100, 120].map((minutes) => (
          <g key={minutes}>
            <line x1={x(minutes)} x2={x(minutes)} y1={TOP} y2={H - BOTTOM} stroke="var(--border)" strokeWidth={1} strokeDasharray="2 4" />
            <text x={x(minutes)} y={H - BOTTOM + 18} textAnchor="middle" fontSize={12} fill="var(--second-text)">
              {minutes} {t.demos.spaceTime.timeAxis}
            </text>
          </g>
        ))}
        {TRAINS.map((train) => {
          const { path, head } = clip(train.points, now);
          const color = train.stopping ? colors[0] : colors[1];
          return (
            <g key={train.id}>
              {path.length > 1 && (
                <polyline
                  points={path.map(([px, py]) => `${px},${py}`).join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeDasharray={train.stopping ? undefined : "8 4"}
                />
              )}
              {head && <circle cx={head[0]} cy={head[1]} r={5} fill={color} />}
            </g>
          );
        })}
        {now < DURATION_MIN && (
          <line x1={x(now)} x2={x(now)} y1={TOP} y2={H - BOTTOM} stroke="var(--main-text)" strokeOpacity={0.4} strokeWidth={1} />
        )}
      </svg>
      <ul className="mt-2 flex flex-wrap justify-center gap-6 text-xs text-second-text" aria-hidden="true">
        <li className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 bg-my-green" />
          {t.demos.spaceTime.stopping}
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 border-t-2 border-dashed border-my-blue" />
          {t.demos.spaceTime.nonStop}
        </li>
      </ul>
    </figure>
  );
}
```

Note : ce composant est déjà dans un `<figure>` de `DemoSection`. Si le
validateur/lint signale un `figure` imbriqué, remplacer le `<figure>` racine
par un `<div>` (même classes).

### 3. Activer — `registry.ts` : entrée `id: "sncf-spacetime"` uniquement, `ready: true`.

### 4. Vérifications

Procédure §4, puis `/research/sncf` :

1. Le graphique s'anime : curseur qui avance, trains qui se dessinent, points
   qui avancent ; les arrêts sont des paliers horizontaux ; le train 3 et le
   train 5 descendent de F vers A.
2. Boucle : fin, pause 2 s, recommence.
3. Émulation `prefers-reduced-motion: reduce` + rechargement : graphique
   complet, immobile.
4. 360 px : SVG réduit, lisible, pas de défilement horizontal.
5. Thème clair et sombre : traits et textes visibles (couleurs = tokens).

Commit : `feat(demos): animated space-time diagram for the SNCF page`

## Critères d'acceptation

- [ ] Graphique espace-temps animé, respect de la réduction des animations.
- [ ] Données fictives, légende FR/EN.
- [ ] lint / tsc / build passent.

## Journal d'exécution

**Lint (5 dernières lignes):**
```
✖ 6 problems (0 errors, 6 warnings)
```

**Build (5 dernières lignes):**
```
├ ○ /personnal/cctv
├ ○ /research/sncf
└ ○ /work/gcii

○  (Static)  prerendered as static content
```

**tsc --noEmit (5 dernières lignes):**
```
npm notice run next-app@0.1.0 npx
npm notice run tsc --noEmit
```

**Vérifications visuelles:**
- Vérification visuelle NON faite, extension claude-in-chrome non connectée.
- Vérification par curl : `/research/sncf` contient la section Démo avec 5 SVG (viewBox présents, confirmés par grep).

## Notes pour la consolidation

Rien.
