import { act, fireEvent, screen, within } from "@testing-library/react";
import { MinesweeperDemo } from "./MinesweeperDemo";
import { COLS, emptyBoard, placeMines } from "./minesweeperLogic";
import { renderWithProviders } from "../../test-utils/render";
import { pointer } from "../../test-utils/three";

/** jsdom's fireEvent cannot set pointerType; dispatch a pointer event that carries it. */
const touch = (el: Element, type: string, pointerType: string) =>
  act(() => {
    pointer(el, type, { pointerType });
  });

/** Same deterministic sequence fed to Math.random and to our own placeMines replay. */
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function cell(row: number, col: number) {
  return screen.getByRole("gridcell", { name: new RegExp(`^Ligne ${row}, colonne ${col} :`) });
}

function cellAt(index: number) {
  return cell(Math.floor(index / COLS) + 1, (index % COLS) + 1);
}

/** Mines the game will place for a first click on `first` with this seed. */
function minesFor(seed: number, first: number) {
  const board = placeMines(emptyBoard(), first, lcg(seed));
  jest.spyOn(Math, "random").mockImplementation(lcg(seed));
  return board;
}

describe("MinesweeperDemo", () => {
  it("starts with 81 hidden cells, 10 mines left and a stopped clock", () => {
    renderWithProviders(<MinesweeperDemo />);
    expect(screen.getByRole("grid", { name: "Grille du démineur, 9 lignes et 9 colonnes" })).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell")).toHaveLength(81);
    expect(screen.getByText("Mines restantes", { exact: false })).toHaveTextContent("10");
    expect(screen.getByText("0 s")).toBeInTheDocument();
    expect(cell(1, 1)).toHaveAccessibleName("Ligne 1, colonne 1 : cachée");
  });

  it("is in English when the visitor chose English", () => {
    renderWithProviders(<MinesweeperDemo />, { language: "en" });
    expect(screen.getByRole("grid", { name: "Minesweeper grid, 9 rows and 9 columns" })).toBeInTheDocument();
    expect(screen.getByRole("gridcell", { name: "Row 1, column 1: hidden" })).toBeInTheDocument();
  });

  it("never loses on the first click, starts the clock, and loses on a mine", () => {
    jest.useFakeTimers();
    try {
      const board = minesFor(7, 40);
      renderWithProviders(<MinesweeperDemo />);
      fireEvent.click(cellAt(40));
      expect(cellAt(40)).toHaveAccessibleName(/mine\(s\) autour$/);

      act(() => jest.advanceTimersByTime(3000));
      expect(screen.getByText("3 s")).toBeInTheDocument();

      const mine = board.findIndex((c) => c.mine);
      fireEvent.click(cellAt(mine));
      expect(screen.getByText("Perdu : une mine a explosé.")).toBeInTheDocument();
      expect(cellAt(mine)).toHaveClass("bg-[#c62828]"); // the one that went off
      const otherMine = board.findIndex((c, i) => c.mine && i !== mine);
      expect(cellAt(otherMine)).toHaveAccessibleName(/: mine$/);
      expect(cellAt(otherMine)).toHaveClass("bg-my-green");
      // Every safe cell is now disabled; further clicks change nothing.
      const safeHidden = board.findIndex((c, i) => !c.mine && i !== 40);
      expect(cellAt(safeHidden)).toBeDisabled();
      fireEvent.contextMenu(cellAt(mine));
      expect(cellAt(mine)).toHaveAccessibleName(/: mine$/);
      fireEvent.click(cellAt(mine));
      expect(screen.getByText("Perdu : une mine a explosé.")).toBeInTheDocument();

      act(() => jest.advanceTimersByTime(3000));
      expect(screen.getByText("3 s")).toBeInTheDocument(); // clock stopped
    } finally {
      jest.useRealTimers();
    }
  });

  it("wins when every safe cell is revealed", () => {
    // Math.random() = 0 packs the mines into the first free cells; a click in
    // the far corner then flood-fills the whole safe area.
    jest.spyOn(Math, "random").mockReturnValue(0);
    renderWithProviders(<MinesweeperDemo />);
    fireEvent.click(cell(9, 9));
    expect(screen.getByText("Gagné en 0 s !")).toBeInTheDocument();
  });

  it("colours numbers with the palette of the current theme", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    const { unmount } = renderWithProviders(<MinesweeperDemo />, { theme: "dark" });
    fireEvent.click(cell(9, 9));
    // Row 2, column 5 touches three mines of row 1.
    expect(within(cell(2, 5)).getByText("3")).toHaveStyle({ color: "#ff6b6b" });
    unmount();

    renderWithProviders(<MinesweeperDemo />, { theme: "light" });
    fireEvent.click(cell(9, 9));
    expect(within(cell(2, 5)).getByText("3")).toHaveStyle({ color: "#c62828" });
  });

  it("flags with right click, the F key and flag mode, and a flag blocks reveal", () => {
    renderWithProviders(<MinesweeperDemo />);
    fireEvent.contextMenu(cell(1, 1));
    expect(cell(1, 1)).toHaveAccessibleName("Ligne 1, colonne 1 : drapeau");
    expect(screen.getByText("Mines restantes", { exact: false })).toHaveTextContent("9");

    fireEvent.click(cell(1, 1)); // flagged: not revealed
    expect(cell(1, 1)).toHaveAccessibleName("Ligne 1, colonne 1 : drapeau");

    fireEvent.keyDown(cell(1, 1), { key: "f" });
    expect(cell(1, 1)).toHaveAccessibleName("Ligne 1, colonne 1 : cachée");
    fireEvent.keyDown(cell(1, 2), { key: "F" });
    expect(cell(1, 2)).toHaveAccessibleName("Ligne 1, colonne 2 : drapeau");
    fireEvent.keyDown(cell(1, 3), { key: "Enter" });
    expect(cell(1, 3)).toHaveAccessibleName("Ligne 1, colonne 3 : cachée");

    const flagMode = screen.getByRole("button", { name: "Mode drapeau" });
    expect(flagMode).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(flagMode);
    expect(flagMode).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(cell(5, 5));
    expect(cell(5, 5)).toHaveAccessibleName("Ligne 5, colonne 5 : drapeau");
    fireEvent.click(flagMode);
    expect(flagMode).toHaveAttribute("aria-pressed", "false");
  });

  it("flags on a touch long press, without revealing on the click that follows", () => {
    jest.useFakeTimers();
    try {
      renderWithProviders(<MinesweeperDemo />);
      touch(cell(3, 3), "pointerdown", "touch");
      act(() => jest.advanceTimersByTime(500));
      touch(cell(3, 3), "pointerup", "touch");
      fireEvent.click(cell(3, 3));
      expect(cell(3, 3)).toHaveAccessibleName("Ligne 3, colonne 3 : drapeau");

      // A short tap is a normal click; a mouse press never starts the timer.
      touch(cell(4, 4), "pointerdown", "touch");
      act(() => jest.advanceTimersByTime(100));
      touch(cell(4, 4), "pointerout", "touch"); // React derives onPointerLeave from pointerout
      act(() => jest.advanceTimersByTime(500));
      expect(cell(4, 4)).toHaveAccessibleName("Ligne 4, colonne 4 : cachée");
      touch(cell(4, 4), "pointerdown", "mouse");
      act(() => jest.advanceTimersByTime(500));
      expect(cell(4, 4)).toHaveAccessibleName("Ligne 4, colonne 4 : cachée");
    } finally {
      jest.useRealTimers();
    }
  });

  it("starts a fresh game on demand", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    renderWithProviders(<MinesweeperDemo />);
    fireEvent.click(cell(9, 9));
    expect(screen.getByText("Gagné en 0 s !")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Nouvelle partie" }));
    expect(screen.queryByText("Gagné en 0 s !")).not.toBeInTheDocument();
    expect(cell(9, 9)).toHaveAccessibleName("Ligne 9, colonne 9 : cachée");
  });
});
