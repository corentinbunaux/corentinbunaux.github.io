import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PredictDemo } from "./PredictDemo";
import { renderWithProviders } from "../../test-utils/render";

const box = () => screen.getByRole("combobox") as HTMLInputElement;
const options = () => screen.queryAllByRole("option").map((o) => o.textContent);
const selected = () => screen.getByRole("option", { selected: true }).textContent;

describe("PredictDemo", () => {
  it("suggests nothing until a word is started", () => {
    renderWithProviders(<PredictDemo />);
    expect(box()).toHaveAttribute("aria-expanded", "false");
    expect(box()).not.toHaveAttribute("aria-activedescendant");
    expect(options()).toEqual([]);
    expect(screen.getByText("Mots appris pendant cette visite : 0")).toBeInTheDocument();
  });

  it("suggests French words by prefix, accent-insensitively", async () => {
    renderWithProviders(<PredictDemo />);
    await userEvent.type(box(), "ec");
    expect(options()).toContain("école");
    expect(box()).toHaveAttribute("aria-expanded", "true");
    expect(box().getAttribute("aria-activedescendant")).toMatch(/-0$/);
  });

  it("navigates with the arrows (wrapping) and accepts with Tab or Enter", async () => {
    renderWithProviders(<PredictDemo />);
    await userEvent.type(box(), "ma");
    const list = options();
    expect(selected()).toBe(list[0]);
    await userEvent.keyboard("{ArrowDown}");
    expect(selected()).toBe(list[1]);
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(selected()).toBe(list[list.length - 1]);
    await userEvent.keyboard("{ArrowDown}");
    expect(selected()).toBe(list[0]);
    await userEvent.keyboard("{Enter}");
    expect(box().value).toBe(`${list[0]} `);
    expect(screen.getByText("Mots appris pendant cette visite : 1")).toBeInTheDocument();

    await userEvent.type(box(), "pr");
    const second = options()[0];
    fireEvent.keyDown(box(), { key: "Tab" });
    expect(box().value).toBe(`${list[0]} ${second} `);
  });

  it("ignores navigation keys with no suggestion, and other keys", async () => {
    renderWithProviders(<PredictDemo />);
    fireEvent.keyDown(box(), { key: "ArrowDown" });
    await userEvent.type(box(), "ma");
    fireEvent.keyDown(box(), { key: "a" });
    expect(box().value).toBe("ma");
  });

  it("accepts a clicked suggestion and ranks learned words first", async () => {
    renderWithProviders(<PredictDemo />);
    await userEvent.type(box(), "ma");
    const last = options()[options().length - 1]!;
    fireEvent.mouseDown(screen.getByRole("option", { name: last }));
    expect(box().value).toBe(`${last} `);

    await userEvent.type(box(), "ma");
    expect(options()[0]).toBe(last);
  });

  it("uses the English list in English", async () => {
    renderWithProviders(<PredictDemo />, { language: "en" });
    await userEvent.type(box(), "comp");
    expect(options()).toEqual(["computer"]);
    expect(screen.getByText("Words learned during this visit: 0")).toBeInTheDocument();
  });
});
