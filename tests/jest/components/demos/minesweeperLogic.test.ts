import {
  COLS,
  MINES,
  ROWS,
  emptyBoard,
  isWon,
  neighbours,
  placeMines,
  reveal,
  revealAllMines,
  toggleFlag,
  type Board,
} from "../../../../src/components/demos/minesweeperLogic";

/** Deterministic PRNG so placeMines is reproducible in tests. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function boardWithMines(mineIndexes: number[]): Board {
  const mines = new Set(mineIndexes);
  return emptyBoard().map((cell, i) => ({
    ...cell,
    mine: mines.has(i),
    adjacent: neighbours(i).filter((n) => mines.has(n)).length,
  }));
}

describe("emptyBoard", () => {
  it("has ROWS*COLS hidden, unflagged, mine-free cells", () => {
    const board = emptyBoard();
    expect(board).toHaveLength(ROWS * COLS);
    expect(board.every((c) => !c.mine && !c.revealed && !c.flagged && c.adjacent === 0)).toBe(true);
  });
});

describe("neighbours", () => {
  it("returns 3 neighbours for a corner", () => {
    expect(neighbours(0).sort((a, b) => a - b)).toEqual([1, COLS, COLS + 1]);
    expect(neighbours(ROWS * COLS - 1)).toHaveLength(3);
  });
  it("returns 5 neighbours for an edge cell and 8 for an inner one", () => {
    expect(neighbours(4)).toHaveLength(5);
    expect(neighbours(COLS + 1)).toHaveLength(8);
    expect(neighbours(COLS + 1)).not.toContain(COLS + 1);
  });
});

describe("placeMines", () => {
  it("places exactly MINES mines, never on the safe cell or its neighbours", () => {
    for (const seed of [1, 2, 3, 42, 99]) {
      const safe = 40;
      const board = placeMines(emptyBoard(), safe, seeded(seed));
      expect(board.filter((c) => c.mine)).toHaveLength(MINES);
      for (const i of [safe, ...neighbours(safe)]) expect(board[i].mine).toBe(false);
    }
  });

  it("computes adjacency counts consistently with mine positions", () => {
    const board = placeMines(emptyBoard(), 0, seeded(7));
    board.forEach((cell, i) => {
      expect(cell.adjacent).toBe(neighbours(i).filter((n) => board[n].mine).length);
    });
  });

  it("works with the default Math.random", () => {
    const board = placeMines(emptyBoard(), 10);
    expect(board.filter((c) => c.mine)).toHaveLength(MINES);
  });
});

describe("reveal", () => {
  it("reveals a numbered cell only, without mutating the input", () => {
    const board = boardWithMines([0]);
    const next = reveal(board, 1);
    expect(next[1].revealed).toBe(true);
    expect(next.filter((c) => c.revealed)).toHaveLength(1);
    expect(board[1].revealed).toBe(false);
  });

  it("flood-fills from a zero cell but never reveals mines", () => {
    const board = boardWithMines([0]);
    const next = reveal(board, ROWS * COLS - 1);
    expect(next[0].revealed).toBe(false);
    expect(next.filter((c) => c.revealed)).toHaveLength(ROWS * COLS - 1);
    expect(isWon(next)).toBe(true);
  });

  it("returns the same board for an already revealed or flagged cell", () => {
    const board = boardWithMines([0]);
    const revealed = reveal(board, 1);
    expect(reveal(revealed, 1)).toBe(revealed);
    const flagged = toggleFlag(board, 1);
    expect(reveal(flagged, 1)).toBe(flagged);
  });

  it("stops the flood fill at flagged cells", () => {
    const board = toggleFlag(boardWithMines([0]), 80);
    const next = reveal(board, 40);
    expect(next[80].revealed).toBe(false);
    expect(next[80].flagged).toBe(true);
  });

  it("reveals a mine when clicked", () => {
    const next = reveal(boardWithMines([0]), 0);
    expect(next[0].revealed).toBe(true);
    expect(next.filter((c) => c.revealed)).toHaveLength(1);
  });
});

describe("toggleFlag", () => {
  it("toggles a hidden cell's flag", () => {
    const flagged = toggleFlag(emptyBoard(), 3);
    expect(flagged[3].flagged).toBe(true);
    expect(toggleFlag(flagged, 3)[3].flagged).toBe(false);
  });
  it("ignores revealed cells", () => {
    const board = reveal(boardWithMines([0]), 1);
    expect(toggleFlag(board, 1)).toBe(board);
  });
});

describe("revealAllMines / isWon", () => {
  it("reveals every mine and nothing else", () => {
    const next = revealAllMines(boardWithMines([0, 10]));
    expect(next.filter((c) => c.revealed)).toHaveLength(2);
    expect(next[0].revealed && next[10].revealed).toBe(true);
  });
  it("is not won while a safe cell is hidden", () => {
    expect(isWon(boardWithMines([0]))).toBe(false);
  });
});
