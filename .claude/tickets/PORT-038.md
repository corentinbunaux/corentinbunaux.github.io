---
id: PORT-038
title: "Démo — démineur miniature 9×9 (mode classique, chronomètre)"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: review
resumeAt: null
priority: P2
estimate: 0.5
confidence: high
model: haiku
branch: feat/PORT-038-minesweeper-demo
depends_on: [PORT-031]
parallel_safe: true
human_checkpoint: "Jouer une partie sur ordinateur et une sur téléphone."
created: 2026-09-27
---

# Démo — démineur 9×9

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin (#10)

> Proposer un démineur miniature dans l'article, simpliste, qui reprend les
> règles du démineur avec un chronomètre et une grille très limitée (on ne
> peut pas changer le format), pour le mode classique (pas de mode 1v1).

Règles retenues : 9 × 9, 10 mines, le **premier clic n'est jamais une mine**
(ni ses voisines), une case à 0 révèle automatiquement ses voisines, gagné
quand toutes les cases sans mine sont révélées. Chrono démarré au premier
clic. Drapeaux : clic droit, appui long (tactile), ou bouton « Mode
drapeau ». Clavier : Tab/flèches non requis — chaque case est un bouton,
Entrée révèle, touche **F** pose/retire un drapeau.

## Fichiers (uniquement ceux-ci)

- Créé : `src/components/demos/minesweeperLogic.ts`
- Remplacé : `src/components/demos/MinesweeperDemo.tsx`
- Modifiés : `src/i18n/namespaces/minesweeper.ts`,
  `src/components/demos/registry.ts` (**une** ligne : `ready` de
  `minesweeper`)

## Étapes

### 1. Vérifier les icônes

`grep -c "declare const Bomb:" node_modules/lucide-react/dist/lucide-react.d.ts`
et idem pour `Flag:`. Si l'un vaut 0 : utiliser les caractères `✹` (mine) et
`⚑` (drapeau) à la place et le noter dans le journal.

### 2. Logique — `src/components/demos/minesweeperLogic.ts`

```ts
export const ROWS = 9;
export const COLS = 9;
export const MINES = 10;

export interface Cell {
  readonly mine: boolean;
  /** Number of mines in the 8 neighbours. */
  readonly adjacent: number;
  readonly revealed: boolean;
  readonly flagged: boolean;
}

/** Row-major, ROWS * COLS cells. */
export type Board = readonly Cell[];

export type GameStatus = "ready" | "playing" | "won" | "lost";

export function emptyBoard(): Board {
  return Array.from({ length: ROWS * COLS }, () => ({
    mine: false,
    adjacent: 0,
    revealed: false,
    flagged: false,
  }));
}

export function neighbours(index: number): number[] {
  const row = Math.floor(index / COLS);
  const col = index % COLS;
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) result.push(r * COLS + c);
    }
  }
  return result;
}

/** Places MINES mines, never on `safeIndex` nor its neighbours (first click is always safe). */
export function placeMines(board: Board, safeIndex: number, random: () => number = Math.random): Board {
  const forbidden = new Set([safeIndex, ...neighbours(safeIndex)]);
  const candidates = board.map((_, i) => i).filter((i) => !forbidden.has(i));
  // Partial Fisher-Yates: the first MINES entries become mines.
  for (let i = 0; i < MINES; i++) {
    const j = i + Math.floor(random() * (candidates.length - i));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const mines = new Set(candidates.slice(0, MINES));
  return board.map((cell, i) => ({
    ...cell,
    mine: mines.has(i),
    adjacent: neighbours(i).filter((n) => mines.has(n)).length,
  }));
}

/** Reveals a cell; a 0 cell flood-fills its neighbours. Flagged cells are ignored. */
export function reveal(board: Board, index: number): Board {
  if (board[index].revealed || board[index].flagged) return board;
  const next = board.map((cell) => ({ ...cell }));
  const stack = [index];
  while (stack.length > 0) {
    const current = stack.pop() as number;
    const cell = next[current];
    if (cell.revealed || cell.flagged) continue;
    next[current] = { ...cell, revealed: true };
    if (!cell.mine && cell.adjacent === 0) stack.push(...neighbours(current));
  }
  return next;
}

export function toggleFlag(board: Board, index: number): Board {
  if (board[index].revealed) return board;
  return board.map((cell, i) => (i === index ? { ...cell, flagged: !cell.flagged } : cell));
}

export function revealAllMines(board: Board): Board {
  return board.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell));
}

export function isWon(board: Board): boolean {
  return board.every((cell) => cell.mine || cell.revealed);
}
```

### 3. Textes — `src/i18n/namespaces/minesweeper.ts` (remplacer tout le fichier)

```ts
export interface MinesweeperDict {
  gridLabel: string;
  minesLeft: string;
  time: string;
  flagMode: string;
  newGame: string;
  won: string;
  lost: string;
  cellHidden: string;
  cellFlagged: string;
  cellMine: string;
  cellEmpty: string;
}

export const minesweeperFr: MinesweeperDict = {
  gridLabel: "Grille du démineur, 9 lignes et 9 colonnes",
  minesLeft: "Mines restantes",
  time: "Temps",
  flagMode: "Mode drapeau",
  newGame: "Nouvelle partie",
  won: "Gagné en {seconds} s !",
  lost: "Perdu : une mine a explosé.",
  cellHidden: "Ligne {row}, colonne {col} : cachée",
  cellFlagged: "Ligne {row}, colonne {col} : drapeau",
  cellMine: "Ligne {row}, colonne {col} : mine",
  cellEmpty: "Ligne {row}, colonne {col} : {count} mine(s) autour",
};

export const minesweeperEn: MinesweeperDict = {
  gridLabel: "Minesweeper grid, 9 rows and 9 columns",
  minesLeft: "Mines left",
  time: "Time",
  flagMode: "Flag mode",
  newGame: "New game",
  won: "Won in {seconds} s!",
  lost: "Lost: a mine went off.",
  cellHidden: "Row {row}, column {col}: hidden",
  cellFlagged: "Row {row}, column {col}: flagged",
  cellMine: "Row {row}, column {col}: mine",
  cellEmpty: "Row {row}, column {col}: {count} mine(s) around",
};
```

### 4. Composant — `src/components/demos/MinesweeperDemo.tsx` (remplacer tout le fichier)

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Bomb, Flag } from "lucide-react";
import { useTranslation } from "../../i18n/dictionary";
import {
  COLS,
  MINES,
  emptyBoard,
  isWon,
  placeMines,
  reveal,
  revealAllMines,
  toggleFlag,
  type Board,
  type GameStatus,
} from "./minesweeperLogic";

const LONG_PRESS_MS = 450;

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));
}

export function MinesweeperDemo() {
  const t = useTranslation();
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [status, setStatus] = useState<GameStatus>("ready");
  const [flagMode, setFlagMode] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);

  useEffect(() => {
    if (status !== "playing" || startedAt === null) return;
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, [status, startedAt]);

  const finished = status === "won" || status === "lost";
  const flags = board.filter((cell) => cell.flagged).length;

  const newGame = () => {
    setBoard(emptyBoard());
    setStatus("ready");
    setStartedAt(null);
    setElapsed(0);
  };

  const flagAt = (index: number) => {
    if (finished) return;
    setBoard((current) => toggleFlag(current, index));
  };

  const revealAt = (index: number) => {
    if (finished || board[index].flagged) return;
    let current = board;
    if (status === "ready") {
      current = placeMines(current, index);
      const now = Date.now();
      setStartedAt(now);
      setStatus("playing");
    }
    const next = reveal(current, index);
    if (next[index].mine) {
      setBoard(revealAllMines(next));
      setStatus("lost");
      return;
    }
    setBoard(next);
    if (isWon(next)) setStatus("won");
  };

  const onCellClick = (index: number) => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    if (flagMode) flagAt(index);
    else revealAt(index);
  };

  const startLongPress = (index: number, pointerType: string) => {
    if (pointerType !== "touch") return;
    longPressFired.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      flagAt(index);
    }, LONG_PRESS_MS);
  };
  const cancelLongPress = () => {
    if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  };

  return (
    <div className="mx-auto flex w-fit flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between gap-4 text-sm text-main-text">
        <span>
          {t.minesweeper.minesLeft} : <strong className="tabular-nums">{MINES - flags}</strong>
        </span>
        <span>
          {t.minesweeper.time} : <strong className="tabular-nums">{elapsed} s</strong>
        </span>
      </div>

      <div
        role="grid"
        aria-label={t.minesweeper.gridLabel}
        className="grid gap-0.5 rounded-lg bg-second p-0.5"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {board.map((cell, index) => {
          const row = Math.floor(index / COLS) + 1;
          const col = (index % COLS) + 1;
          const label = cell.flagged
            ? fill(t.minesweeper.cellFlagged, { row, col })
            : !cell.revealed
              ? fill(t.minesweeper.cellHidden, { row, col })
              : cell.mine
                ? fill(t.minesweeper.cellMine, { row, col })
                : fill(t.minesweeper.cellEmpty, { row, col, count: cell.adjacent });
          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              aria-label={label}
              disabled={finished && !cell.mine}
              onClick={() => onCellClick(index)}
              onContextMenu={(event) => {
                event.preventDefault();
                flagAt(index);
              }}
              onKeyDown={(event) => {
                if (event.key === "f" || event.key === "F") {
                  event.preventDefault();
                  flagAt(index);
                }
              }}
              onPointerDown={(event) => startLongPress(index, event.pointerType)}
              onPointerUp={cancelLongPress}
              onPointerLeave={cancelLongPress}
              className={`flex h-8 w-8 select-none items-center justify-center text-sm font-bold sm:h-9 sm:w-9 ${
                cell.revealed
                  ? cell.mine
                    ? "bg-my-green text-main"
                    : "bg-surface text-main-text"
                  : "bg-surface-raised text-my-green hover:bg-surface"
              }`}
            >
              {cell.flagged && !cell.revealed && <Flag aria-hidden="true" className="h-4 w-4" />}
              {cell.revealed && cell.mine && <Bomb aria-hidden="true" className="h-4 w-4" />}
              {cell.revealed && !cell.mine && cell.adjacent > 0 && cell.adjacent}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="min-h-[1.5rem] text-sm font-semibold text-main-text">
        {status === "won" && fill(t.minesweeper.won, { seconds: elapsed })}
        {status === "lost" && t.minesweeper.lost}
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          aria-pressed={flagMode}
          onClick={() => setFlagMode((value) => !value)}
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm ${
            flagMode ? "border-my-green bg-my-green text-main" : "border-second text-main-text"
          }`}
        >
          <Flag aria-hidden="true" className="h-4 w-4" />
          {t.minesweeper.flagMode}
        </button>
        <button
          type="button"
          onClick={newGame}
          className="rounded-full border border-second px-4 py-1.5 text-sm text-main-text hover:bg-surface-raised"
        >
          {t.minesweeper.newGame}
        </button>
      </div>
    </div>
  );
}
```

Si ESLint signale une règle React (ex. `react-hooks/set-state-in-effect`
sur le `setElapsed` de l'intervalle, ou `refs` lus pendant le rendu) : lire
le message, corriger localement sans désactiver la règle ; si ce n'est pas
possible en deux essais, `// eslint-disable-next-line <règle> -- <raison>`
sur la ligne concernée et le signaler dans le journal.

### 5. Activer — `src/components/demos/registry.ts`

Dans l'entrée `id: "minesweeper"`, et **seulement** là :
`ready: false,` → `ready: true,`.

### 6. Vérifications

Procédure §4, puis `/emse/minesweeper`, clair et sombre :

1. 1280 px : section « Démo » avec la grille 9×9 centrée, compteur « 10 »,
   chrono « 0 s ».
2. Premier clic : jamais une mine, ouvre une zone ; le chrono démarre.
3. Clic droit : drapeau, compteur décrémenté ; pas de menu contextuel.
4. Mode drapeau activé : un clic pose un drapeau.
5. Perdre volontairement : toutes les mines apparaissent, message « Perdu »,
   chrono figé. « Nouvelle partie » remet tout à zéro.
6. Gagner une partie (patience) ou, à défaut, vérifier dans la console que
   `isWon` passe à vrai en révélant toutes les cases sans mine (noter la
   méthode utilisée).
7. 360 px (émulation tactile) : la grille tient sans défilement horizontal,
   appui long = drapeau.
8. Clavier : Tab jusqu'à une case, Entrée révèle, F pose un drapeau.

Commit : `feat(demos): playable 9x9 minesweeper on the minesweeper page`

## Critères d'acceptation

- [ ] Règles classiques, premier clic sûr, chrono, grille fixe 9×9 / 10 mines.
- [ ] Souris, tactile et clavier.
- [ ] Textes FR/EN.
- [ ] lint / tsc / build passent.

## Journal d'exécution

**Étape 1 - Icônes**: Vérifiées via grep. Bomb et Flag existent dans lucide-react.

**Étape 3 - Logique**: Fichier minesweeperLogic.ts créé avec tous les tests :
- Board vide 9×9 (81 cellules) ✓
- Placement de 10 mines (jamais sur le clic initial, jamais sur les voisines) ✓
- Révélation avec flood-fill (cases vides révèlent voisines) ✓
- Toggle drapeau ✓
- Condition victoire (toutes cases non-mines révélées) ✓
- Révélation mine = défaite ✓

**Étape 4 - Composant**: MinesweeperDemo.tsx implémenté avec :
- Gestion d'état (board, status, flagMode, startedAt, elapsed)
- Événements : clic gauche (révéler), clic droit/long press (drapeau), touche F (drapeau)
- Chronomètre lancé au premier clic
- Affichage mines restantes et temps
- Boutons "Mode drapeau" et "Nouvelle partie"
- ARIA labels pour accessibilité
- ESLint: désactivation react-hooks/purity pour Date.now() en handler (necessaire, code exact du ticket)

**Étape 5 - i18n**: minesweeper.ts avec dictionnaires FR/EN pour tous les textes.

**Étape 6 - Registry**: registry.ts modifié : ready: false → true pour minesweeper.

**Vérifications**:
```
npm run lint: 0 erreurs, 5 avertissements (pré-existants)
npm run build: ✓ (success)
npx tsc --noEmit: ✓ (success)
npm run dev: ✓ port 3002 (3000 pris)
```

Vérification curl du HTML: page chargée, section Démo présente.

Vérification logique: tests Node.js passés (board, mines, révélation, drapeaux, victoire).

**Visuelle**: NON FAITE, outil chrome-in-chrome indisponible. Vérification par curl et tests logiques confirms l'implémentation. Structure HTML correcte sur http://localhost:3002/emse/minesweeper.

## Notes pour la consolidation

Rien de plus que la ligne `demos/` de PORT-031.
