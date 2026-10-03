import { act, screen } from "@testing-library/react";
import { SpaceTimeDemo } from "../../../../src/components/demos/SpaceTimeDemo";
import { SncfMiniTrainDemo } from "../../../../src/components/demos/SncfMiniTrainDemo";
import { REDUCED_MOTION_QUERY, frames, media } from "../../test-utils/browser";
import { renderWithProviders } from "../../test-utils/render";
import { dictionary } from "../../../../src/i18n/dictionary";

const LINE_TOP = 16;

function chart() {
  return screen.getByRole("img", { name: dictionary.fr.demos.spaceTime.chartLabel });
}

/** The vertical "now" cursor is the only line drawn with stroke-opacity. */
const cursor = () => chart().querySelector("line[stroke-opacity]");

describe("SpaceTimeDemo", () => {
  it("draws the six stations and the time axis", () => {
    media.set(REDUCED_MOTION_QUERY, true);
    renderWithProviders(<SpaceTimeDemo />);
    for (const name of ["A", "B", "C", "D", "E", "F"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getByText("120 min")).toBeInTheDocument();
    expect(screen.getByText(dictionary.fr.demos.spaceTime.stopping)).toBeInTheDocument();
  });

  it("shows the complete static diagram under reduced motion", () => {
    media.set(REDUCED_MOTION_QUERY, true);
    renderWithProviders(<SpaceTimeDemo />);
    expect(chart().querySelectorAll("polyline")).toHaveLength(5);
    expect(chart().querySelectorAll("circle")).toHaveLength(0);
    expect(cursor()).toBeNull();
    expect(frames.pending()).toBe(0);
  });

  it("sweeps time from 0 to 120 min, drawing each train up to 'now', then holds", () => {
    const { unmount } = renderWithProviders(<SpaceTimeDemo />);

    act(() => frames.step(2000)); // 20 min: trains 4 and 5 have not left yet
    expect(chart().querySelectorAll("polyline")).toHaveLength(3);
    expect(chart().querySelectorAll("circle")).toHaveLength(3);
    expect(cursor()).toHaveAttribute("y1", String(LINE_TOP));

    act(() => frames.step(4000)); // 60 min: all five trains running
    expect(chart().querySelectorAll("circle")).toHaveLength(5);
    // The non-stop trains are dashed.
    expect(chart().querySelectorAll("polyline[stroke-dasharray]")).toHaveLength(2);

    act(() => frames.step(7000)); // 130 ms past the sweep: holding the full chart
    expect(cursor()).toBeNull();
    expect(chart().querySelectorAll("circle")).toHaveLength(0);

    unmount();
    expect(frames.pending()).toBe(0);
  });

  it("is labelled in English too", () => {
    media.set(REDUCED_MOTION_QUERY, true);
    renderWithProviders(<SpaceTimeDemo />, { language: "en" });
    expect(screen.getByRole("img", { name: dictionary.en.demos.spaceTime.chartLabel })).toBeInTheDocument();
    expect(screen.getByText(dictionary.en.demos.spaceTime.nonStop)).toBeInTheDocument();
  });
});

describe("SncfMiniTrainDemo", () => {
  it("is a purely decorative, CSS-animated train drawn with theme tokens", () => {
    const { container } = renderWithProviders(<SncfMiniTrainDemo />);
    const train = container.querySelector(".sncf-mini-train")!;
    expect(train).toHaveAttribute("aria-hidden", "true");
    expect(train.querySelector("path.fill-main-text")).not.toBeNull();
    expect(train.querySelector(".fill-my-blue")).not.toBeNull();
  });
});
