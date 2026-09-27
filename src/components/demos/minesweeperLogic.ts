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
