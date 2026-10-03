import {
  CELL_COUNT,
  GRID,
  SIZE,
  TARGETS,
  coverage,
  coveredBy,
  kindAt,
  optimalGuards,
} from "../../../../src/components/demos/guardsLogic";

describe("grid", () => {
  it("is SIZE x SIZE", () => {
    expect(GRID).toHaveLength(SIZE);
    GRID.forEach((row) => expect(row).toHaveLength(SIZE));
    expect(CELL_COUNT).toBe(SIZE * SIZE);
  });

  it("classifies cells", () => {
    expect(kindAt(0)).toBe("empty");
    expect(kindAt(2)).toBe("target");
    expect(kindAt(4)).toBe("wall");
  });

  it("has the 13 documented targets", () => {
    expect(TARGETS).toHaveLength(13);
    TARGETS.forEach((t) => expect(kindAt(t)).toBe("target"));
  });
});

describe("coverage", () => {
  it("includes the guard cell and stops at walls", () => {
    // Row 0 is "..T.#...T.": a guard at 0 sees 1..3 along the row, not the wall at 4 nor beyond.
    const seen = coverage(0);
    expect(seen.has(0)).toBe(true);
    expect([1, 2, 3].every((c) => seen.has(c))).toBe(true);
    expect(seen.has(4)).toBe(false);
    expect(seen.has(5)).toBe(false);
  });

  it("stops at the grid edge without wrapping to the next row", () => {
    const seen = coverage(9);
    expect(seen.has(10)).toBe(false);
    expect(seen.has(19)).toBe(true);
  });

  it("never contains a wall", () => {
    for (let i = 0; i < CELL_COUNT; i++) {
      if (kindAt(i) === "wall") continue;
      for (const c of coverage(i)) expect(kindAt(c)).not.toBe("wall");
    }
  });
});

describe("coveredBy", () => {
  it("is the union of each guard's coverage", () => {
    const union = coveredBy([0, 99]);
    for (const c of coverage(0)) expect(union.has(c)).toBe(true);
    for (const c of coverage(99)) expect(union.has(c)).toBe(true);
    expect(coveredBy([]).size).toBe(0);
  });
});

describe("optimalGuards", () => {
  it("finds a 6-guard cover of every target (the documented optimum)", () => {
    const guards = optimalGuards();
    expect(guards).toHaveLength(6);
    const covered = coveredBy(guards);
    TARGETS.forEach((t) => expect(covered.has(t)).toBe(true));
    guards.forEach((g) => expect(kindAt(g)).not.toBe("wall"));
  });
});
