---
id: PORT-039
title: "Démo — projet optimisation « surveillants » (grille 10×10 avec murs, optimum calculé)"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: review
resumeAt: null
priority: P2
estimate: 0.5
confidence: high
model: haiku
branch: feat/PORT-039-guards-demo
depends_on: [PORT-031]
parallel_safe: true
human_checkpoint: "Vérifier que les règles correspondent au projet d'origine (surveillant autorisé sur une cible ?)."
created: 2026-09-27
---

# Démo — les surveillants

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin (#12) et règles précisées le 2026-09-27

> Défi de programmation en binôme, consistant à optimiser un nombre de
> « surveillants » en fonction de la répartition des « cibles » dans une grille.

- Un surveillant couvre **sa ligne et sa colonne**.
- Des **murs** bloquent la vue : il ne voit pas au-delà d'un mur.
- Objectif : couvrir toutes les cibles avec **le moins** de surveillants.
- Grille de démonstration : 10 × 10 (la taille réelle variait).
- Hypothèses (à confirmer par Corentin, voir checkpoint) : un surveillant se
  place sur toute case **non-mur**, y compris une cible (il la couvre) ; les
  cibles ne bloquent pas la vue.

La grille ci-dessous a été vérifiée le 2026-09-27 par recherche exhaustive :
**13 cibles, optimum = 6 surveillants**, par exemple (ligne, colonne) en base
0 : (0,0) (0,5) (1,2) (3,7) (7,1) (7,6).

## Fichiers (uniquement ceux-ci)

- Créé : `src/components/demos/guardsLogic.ts`
- Remplacé : `src/components/demos/GuardsDemo.tsx`
- Modifiés : `src/i18n/namespaces/guards.ts`,
  `src/components/demos/registry.ts` (ligne `ready` de `guards`)

## Étapes

### 1. Icônes

Vérifier `Eye` et `Target` :
`grep -c "declare const Eye:" node_modules/lucide-react/dist/lucide-react.d.ts`
(idem `Target:`). Si 0 : utiliser `◉` (surveillant) et `✚` (cible).

### 2. Logique — `src/components/demos/guardsLogic.ts`

```ts
/** '#' wall, 'T' target, '.' empty. Verified: 13 targets, optimum 6 guards. */
export const GRID = [
  "..T.#...T.",
  ".#....T.#.",
  "T..#......",
  ".....T#..T",
  ".#T.....#.",
  "....#..T..",
  "T.#.......",
  "....T#..T.",
  ".T.#...#..",
  "......T...",
] as const;

export const SIZE = 10;

export type CellKind = "wall" | "target" | "empty";

export function kindAt(index: number): CellKind {
  const char = GRID[Math.floor(index / SIZE)][index % SIZE];
  return char === "#" ? "wall" : char === "T" ? "target" : "empty";
}

export const CELL_COUNT = SIZE * SIZE;
export const TARGETS: readonly number[] = Array.from({ length: CELL_COUNT }, (_, i) => i).filter(
  (i) => kindAt(i) === "target",
);

/** Cells seen by a guard at `index`: itself, then each direction until a wall or the edge. */
export function coverage(index: number): Set<number> {
  const seen = new Set<number>([index]);
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < SIZE && c >= 0 && c < SIZE && kindAt(r * SIZE + c) !== "wall") {
      seen.add(r * SIZE + c);
      r += dr;
      c += dc;
    }
  }
  return seen;
}

export function coveredBy(guards: Iterable<number>): Set<number> {
  const covered = new Set<number>();
  for (const guard of guards) for (const cell of coverage(guard)) covered.add(cell);
  return covered;
}

/**
 * Minimum set of guards covering every target — branch and bound: take the
 * first uncovered target, try every cell that sees it, prune any branch that
 * cannot beat the best found. Instant on a 10x10 grid.
 */
export function optimalGuards(): number[] {
  const candidates = Array.from({ length: CELL_COUNT }, (_, i) => i)
    .filter((i) => kindAt(i) !== "wall")
    .map((i) => ({ cell: i, sees: coverage(i) }));
  let best: number[] | null = null;

  const search = (chosen: number[], uncovered: number[]) => {
    if (best && chosen.length >= best.length) return;
    if (uncovered.length === 0) {
      best = [...chosen];
      return;
    }
    const target = uncovered[0];
    for (const { cell, sees } of candidates) {
      if (!sees.has(target)) continue;
      search([...chosen, cell], uncovered.filter((t) => !sees.has(t)));
    }
  };

  search([], [...TARGETS]);
  if (!best) throw new Error("guardsLogic: no covering found (grid is inconsistent).");
  return best;
}
```

### 3. Textes — `src/i18n/namespaces/guards.ts` (remplacer tout le fichier)

```ts
export interface GuardsDict {
  gridLabel: string;
  guardsCount: string;
  targetsCovered: string;
  showSolution: string;
  hideSolution: string;
  reset: string;
  allCovered: string;
  optimalReached: string;
  legendWall: string;
  legendTarget: string;
  legendGuard: string;
  cellLabel: string;
  kindWall: string;
  kindTarget: string;
  kindEmpty: string;
  withGuard: string;
  covered: string;
}

export const guardsFr: GuardsDict = {
  gridLabel: "Grille des surveillants, 10 lignes et 10 colonnes",
  guardsCount: "Surveillants",
  targetsCovered: "Cibles couvertes",
  showSolution: "Voir une solution optimale",
  hideSolution: "Revenir à ma grille",
  reset: "Tout effacer",
  allCovered: "Toutes les cibles sont couvertes avec {count} surveillants. L'optimum est {best}.",
  optimalReached: "Bravo, c'est optimal : {best} surveillants !",
  legendWall: "Mur",
  legendTarget: "Cible",
  legendGuard: "Surveillant",
  cellLabel: "Ligne {row}, colonne {col} : {kind}",
  kindWall: "mur",
  kindTarget: "cible",
  kindEmpty: "vide",
  withGuard: ", surveillant",
  covered: ", couverte",
};

export const guardsEn: GuardsDict = {
  gridLabel: "Guards grid, 10 rows and 10 columns",
  guardsCount: "Guards",
  targetsCovered: "Targets covered",
  showSolution: "Show an optimal solution",
  hideSolution: "Back to my grid",
  reset: "Clear all",
  allCovered: "Every target is covered with {count} guards. The optimum is {best}.",
  optimalReached: "Well done, that's optimal: {best} guards!",
  legendWall: "Wall",
  legendTarget: "Target",
  legendGuard: "Guard",
  cellLabel: "Row {row}, column {col}: {kind}",
  kindWall: "wall",
  kindTarget: "target",
  kindEmpty: "empty",
  withGuard: ", guard",
  covered: ", covered",
};
```

### 4. Composant — `src/components/demos/GuardsDemo.tsx` (remplacer tout le fichier)

```tsx
"use client";

import { useMemo, useState } from "react";
import { Eye, Target } from "lucide-react";
import { useTranslation } from "../../i18n/dictionary";
import { CELL_COUNT, SIZE, TARGETS, coveredBy, kindAt, optimalGuards } from "./guardsLogic";

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));
}

export function GuardsDemo() {
  const t = useTranslation();
  const [guards, setGuards] = useState<ReadonlySet<number>>(new Set());
  const [showSolution, setShowSolution] = useState(false);
  const optimum = useMemo(() => optimalGuards(), []);

  const displayed = showSolution ? new Set(optimum) : guards;
  const covered = coveredBy(displayed);
  const coveredTargets = TARGETS.filter((i) => covered.has(i)).length;
  const allCovered = coveredTargets === TARGETS.length;

  const toggle = (index: number) => {
    if (showSolution || kindAt(index) === "wall") return;
    setGuards((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="mx-auto flex w-fit flex-col items-center gap-4">
      <div className="flex w-full flex-wrap justify-between gap-4 text-sm text-main-text">
        <span>
          {t.guards.guardsCount} : <strong className="tabular-nums">{displayed.size}</strong>
        </span>
        <span>
          {t.guards.targetsCovered} :{" "}
          <strong className="tabular-nums">
            {coveredTargets} / {TARGETS.length}
          </strong>
        </span>
      </div>

      <div
        role="grid"
        aria-label={t.guards.gridLabel}
        className="grid gap-0.5 rounded-lg bg-second p-0.5"
        style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: CELL_COUNT }, (_, index) => {
          const kind = kindAt(index);
          const hasGuard = displayed.has(index);
          const isCovered = covered.has(index);
          const kindLabel =
            kind === "wall" ? t.guards.kindWall : kind === "target" ? t.guards.kindTarget : t.guards.kindEmpty;
          const label =
            fill(t.guards.cellLabel, { row: Math.floor(index / SIZE) + 1, col: (index % SIZE) + 1, kind: kindLabel }) +
            (hasGuard ? t.guards.withGuard : "") +
            (kind === "target" && isCovered ? t.guards.covered : "");

          let className = "bg-surface-raised text-my-green hover:bg-surface";
          if (kind === "wall") className = "bg-main-text";
          else if (hasGuard) className = "bg-my-blue text-main";
          else if (kind === "target" && isCovered) className = "bg-my-green text-main";
          else if (isCovered) className = "bg-surface text-my-blue";

          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              aria-label={label}
              aria-pressed={kind === "wall" ? undefined : hasGuard}
              disabled={kind === "wall"}
              onClick={() => toggle(index)}
              className={`flex h-7 w-7 items-center justify-center sm:h-9 sm:w-9 ${className}`}
            >
              {hasGuard && <Eye aria-hidden="true" className="h-4 w-4" />}
              {!hasGuard && kind === "target" && <Target aria-hidden="true" className="h-4 w-4" />}
              {!hasGuard && kind === "empty" && isCovered && <span aria-hidden="true">·</span>}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="min-h-[1.5rem] text-center text-sm font-semibold text-main-text">
        {allCovered &&
          (displayed.size === optimum.length
            ? fill(t.guards.optimalReached, { best: optimum.length })
            : fill(t.guards.allCovered, { count: displayed.size, best: optimum.length }))}
      </p>

      <ul className="flex gap-4 text-xs text-second-text" aria-hidden="true">
        <li className="flex items-center gap-1"><span className="inline-block h-3 w-3 bg-main-text" />{t.guards.legendWall}</li>
        <li className="flex items-center gap-1"><Target className="h-3 w-3 text-my-green" />{t.guards.legendTarget}</li>
        <li className="flex items-center gap-1"><Eye className="h-3 w-3 text-my-blue" />{t.guards.legendGuard}</li>
      </ul>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          aria-pressed={showSolution}
          onClick={() => setShowSolution((value) => !value)}
          className="rounded-full border border-second px-4 py-1.5 text-sm text-main-text hover:bg-surface-raised"
        >
          {showSolution ? t.guards.hideSolution : t.guards.showSolution}
        </button>
        <button
          type="button"
          onClick={() => {
            setGuards(new Set());
            setShowSolution(false);
          }}
          className="rounded-full border border-second px-4 py-1.5 text-sm text-main-text hover:bg-surface-raised"
        >
          {t.guards.reset}
        </button>
      </div>
    </div>
  );
}
```

### 5. Activer — `registry.ts` : entrée `id: "guards"` uniquement, `ready: true`.

### 6. Vérifications

Procédure §4, puis `/emse/programming`, clair et sombre, 1280 et 360 px :

1. Grille 10×10 : 13 cibles, murs pleins, compteur « 0 / 13 ».
2. Poser un surveillant : sa ligne et sa colonne s'éclairent **jusqu'au
   premier mur** (vérifier sur la case ligne 1 colonne 1 : la vue vers la
   droite s'arrête avant le mur de la colonne 5).
3. Placer les 6 surveillants (0,0) (0,5) (1,2) (3,7) (7,1) (7,6) (en base 0,
   donc lignes/colonnes affichées +1) → « Bravo, c'est optimal : 6 ».
4. « Voir une solution optimale » affiche 6 surveillants et 13 / 13 ; « Revenir
   à ma grille » restaure ma sélection.
5. Mur non cliquable ; à 360 px pas de défilement horizontal.
6. Dans la console : `performance` — le calcul d'optimum ne bloque pas
   l'affichage (page fluide) ; noter le temps si mesuré.

Commit : `feat(demos): interactive guards optimisation puzzle`

## Critères d'acceptation

- [ ] Règles : ligne + colonne, murs bloquants, cibles à couvrir.
- [ ] Optimum calculé = 6, solution affichable.
- [ ] Textes FR/EN, clavier (chaque case est un bouton).
- [ ] lint / tsc / build passent.

## Journal d'exécution

Commandes lancées :

```
npm run lint
```
✓ Linter passed (6 warnings unrelated to changes)

```
npm run build
```
✓ Build completed successfully

```
npx tsc --noEmit
```
✓ Type checking passed

Vérification :
- Icônes Eye et Target présentes dans lucide-react : ✓
- TARGETS.length : 13 ✓
- optimalGuards() retourne 6 surveillants ✓
- Server npm run dev lancé sur port 3000
- Page /emse/programming accessible via curl : ✓ Contient "Projet optimisation : les surveillants"

Note : Vérification visuelle NON faite (chrome extension non disponible). Vérification par curl confirme la présence de la section Démo.

## Notes pour la consolidation

- Hypothèses de règles à faire valider (surveillant sur une cible autorisé).
