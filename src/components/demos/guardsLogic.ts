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
