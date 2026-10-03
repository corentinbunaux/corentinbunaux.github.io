import { fireEvent, screen, within } from "@testing-library/react";
import { GuardsDemo } from "../../../../src/components/demos/GuardsDemo";
import { SIZE, optimalGuards } from "../../../../src/components/demos/guardsLogic";
import { renderWithProviders } from "../../test-utils/render";

const cellAt = (index: number) =>
  screen.getByRole("gridcell", {
    name: new RegExp(`^(Ligne|Row) ${Math.floor(index / SIZE) + 1}, (colonne|column) ${(index % SIZE) + 1} ?:`),
  });

const status = () => screen.getByText("Cibles couvertes", { exact: false });

describe("GuardsDemo", () => {
  it("shows the grid with walls disabled and nothing covered", () => {
    renderWithProviders(<GuardsDemo />);
    expect(screen.getAllByRole("gridcell")).toHaveLength(100);
    expect(cellAt(4)).toHaveAccessibleName("Ligne 1, colonne 5 : mur");
    expect(cellAt(4)).toBeDisabled();
    expect(cellAt(2)).toHaveAccessibleName("Ligne 1, colonne 3 : cible");
    expect(status()).toHaveTextContent("0 / 13");
  });

  it("places and removes a guard, marking what it sees", () => {
    renderWithProviders(<GuardsDemo />);
    fireEvent.click(cellAt(0));
    expect(cellAt(0)).toHaveAccessibleName("Ligne 1, colonne 1 : vide, surveillant");
    expect(cellAt(0)).toHaveAttribute("aria-selected", "true");
    // Row 0 is "..T.#": the target at col 3 is seen, the empty cell at col 2 too.
    expect(cellAt(2)).toHaveAccessibleName("Ligne 1, colonne 3 : cible, couverte");
    expect(within(cellAt(1)).getByText("·")).toBeInTheDocument();
    expect(screen.getByText("Surveillants", { exact: false })).toHaveTextContent("1");

    fireEvent.click(cellAt(0));
    expect(cellAt(0)).toHaveAccessibleName("Ligne 1, colonne 1 : vide");
    expect(status()).toHaveTextContent("0 / 13");
  });

  it("ignores clicks on walls", () => {
    renderWithProviders(<GuardsDemo />);
    fireEvent.click(cellAt(4));
    expect(screen.getByText("Surveillants", { exact: false })).toHaveTextContent("0");
  });

  it("congratulates an optimal cover, and reports a non-optimal one", () => {
    renderWithProviders(<GuardsDemo />);
    const optimum = optimalGuards();
    optimum.forEach((g) => fireEvent.click(cellAt(g)));
    expect(status()).toHaveTextContent("13 / 13");
    expect(screen.getByText("Bravo, c'est optimal : 6 surveillants !")).toBeInTheDocument();

    const extra = Array.from({ length: 100 }, (_, i) => i).find(
      (i) => !optimum.includes(i) && !cellAt(i).hasAttribute("disabled"),
    )!;
    fireEvent.click(cellAt(extra));
    expect(
      screen.getByText("Toutes les cibles sont couvertes avec 7 surveillants. L'optimum est 6."),
    ).toBeInTheDocument();
  });

  it("shows and hides an optimal solution, locking the grid meanwhile, and resets", () => {
    renderWithProviders(<GuardsDemo />, { language: "en" });
    fireEvent.click(cellAt(0));
    const toggle = screen.getByRole("button", { name: "Show an optimal solution" });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).toHaveTextContent("Back to my grid");
    expect(screen.getByText("Well done, that's optimal: 6 guards!")).toBeInTheDocument();

    fireEvent.click(cellAt(0)); // locked while the solution is shown
    fireEvent.click(toggle);
    expect(cellAt(0)).toHaveAccessibleName(/guard$/);

    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Guards", { exact: false })).toHaveTextContent("0");
  });
});
