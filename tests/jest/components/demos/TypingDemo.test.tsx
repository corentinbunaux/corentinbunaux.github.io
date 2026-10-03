import { act, fireEvent, screen } from "@testing-library/react";
import { TypingDemo } from "../../../../src/components/demos/TypingDemo";
import { TYPING_SENTENCES } from "../../../../src/components/demos/typingSentences";
import { renderWithProviders } from "../../test-utils/render";
import { useLanguage } from "../../../../src/i18n/LanguageContext";

const input = () => screen.getByLabelText("Tapez la phrase affichée") as HTMLInputElement;
const type = (value: string) => fireEvent.change(input(), { target: { value } });

describe("TypingDemo", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });
  afterEach(() => jest.useRealTimers());

  it("shows the first sentence and idle stats", () => {
    renderWithProviders(<TypingDemo />);
    expect(screen.getAllByText(TYPING_SENTENCES.fr[0]).length).toBeGreaterThan(0);
    expect(screen.getByText("0.0 s")).toBeInTheDocument();
    expect(screen.getByText("0 mots/min")).toBeInTheDocument();
    expect(screen.getByText("100 %")).toBeInTheDocument();
  });

  it("times the run, counts errors and reports speed and accuracy on finish", () => {
    renderWithProviders(<TypingDemo />);
    const target = TYPING_SENTENCES.fr[0];

    type("Lx"); // one wrong keystroke
    act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByText("1.0 s")).toBeInTheDocument();
    expect(screen.getByText("50 %")).toBeInTheDocument();

    type("L"); // backspace: no new keystroke
    expect(screen.getByText("50 %")).toBeInTheDocument();

    jest.setSystemTime(Date.now() + 11000); // 12 s in total
    type(target);
    const keystrokes = 2 + (target.length - 1);
    const accuracy = Math.round(((keystrokes - 1) / keystrokes) * 100);
    const wpm = Math.round(target.length / 5 / (12 / 60));
    expect(screen.getByText(`Arrivée ! ${wpm} mots/min, ${accuracy} % de précision.`)).toBeInTheDocument();
    expect(input()).toBeDisabled();

    act(() => jest.advanceTimersByTime(5000));
    expect(screen.getByText("12.0 s")).toBeInTheDocument(); // frozen
  });

  it("highlights correct and wrong characters, and blocks paste", () => {
    const { container } = renderWithProviders(<TypingDemo />);
    type("Lx");
    const chars = container.querySelectorAll("p[aria-hidden='true'] span");
    expect(chars[0]).toHaveClass("text-my-green");
    expect(chars[1]).toHaveClass("bg-my-blue");
    expect(chars[2]).toHaveClass("underline");
    expect(chars[3]).toHaveClass("text-second-text");

    const paste = new Event("paste", { bubbles: true, cancelable: true });
    input().dispatchEvent(paste);
    expect(paste.defaultPrevented).toBe(true);
  });

  it("ignores input after the finish line", () => {
    renderWithProviders(<TypingDemo />);
    type(TYPING_SENTENCES.fr[0]);
    fireEvent.change(input(), { target: { value: "autre" } });
    expect(input().value).toBe(TYPING_SENTENCES.fr[0]);
  });

  it("draws a different sentence for a new round and resets", () => {
    jest.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValueOnce(0.5);
    renderWithProviders(<TypingDemo />);
    type("Le");
    fireEvent.click(screen.getByRole("button", { name: "Nouvelle phrase" }));
    // 0 -> index 0 is the current one, redrawn; 0.5 -> index 4.
    expect(screen.getAllByText(TYPING_SENTENCES.fr[4]).length).toBeGreaterThan(0);
    expect(input().value).toBe("");
    expect(screen.getByText("0.0 s")).toBeInTheDocument();
  });

  it("restarts in the other language when the language changes", () => {
    function Switch() {
      const { setLanguage } = useLanguage();
      return <button onClick={() => setLanguage("en")}>en</button>;
    }
    renderWithProviders(
      <>
        <Switch />
        <TypingDemo />
      </>,
    );
    type("Le");
    fireEvent.click(screen.getByRole("button", { name: "en" }));
    expect(screen.getAllByText(TYPING_SENTENCES.en[0]).length).toBeGreaterThan(0);
    expect((screen.getByLabelText("Type the sentence shown") as HTMLInputElement).value).toBe("");
  });
});
