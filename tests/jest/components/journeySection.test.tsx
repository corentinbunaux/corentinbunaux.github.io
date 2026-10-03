import { screen, within } from "@testing-library/react";
import JourneySection from "../../../src/components/journeySection";
import { education } from "../../../src/data/education";
import { dictionary } from "../../../src/i18n/dictionary";
import { setDesktop } from "../test-utils/browser";
import { renderWithProviders } from "../test-utils/render";
import { renderIsolated } from "../test-utils/isolated";

const fr = dictionary.fr;
const en = dictionary.en;

function track(name: string) {
  return screen.getByRole("region", { name });
}

describe("JourneySection", () => {
  beforeEach(() => setDesktop(false));

  it("lists dated experiences newest first, flagging the current position", () => {
    renderWithProviders(<JourneySection />);
    const experience = track(fr.journey.experienceTrack);
    const links = within(experience).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/work/gcii",
      "/internships/safran",
      "/internships/quimesis",
      "/internships/kusmitea",
    ]);
    expect(within(links[0]).getByText(fr.journey.currentBadge)).toBeInTheDocument();
    expect(within(links[1]).queryByText(fr.journey.currentBadge)).not.toBeInTheDocument();
  });

  it("formats ongoing, same-year and single-month periods", () => {
    renderWithProviders(<JourneySection />);
    expect(screen.getByText("novembre 2025 → aujourd'hui")).toBeInTheDocument();
    expect(screen.getByText("avril – septembre 2025")).toBeInTheDocument();
    expect(screen.getByText("janvier 2023")).toBeInTheDocument();
  });

  it("adds the location to the subtitle only when it is known", () => {
    renderWithProviders(<JourneySection />);
    expect(screen.getByText(`${fr.journey.title}`)).toBeInTheDocument();
    const gcii = screen.getByRole("link", { name: /GCII/ });
    expect(gcii).toHaveTextContent("· Le Havre");
    const safran = screen.getByRole("link", { name: /Safran/ });
    expect(safran).not.toHaveTextContent("·");
  });

  it("lists education, linking only entries that have a page", () => {
    renderWithProviders(<JourneySection />, { language: "en" });
    const formation = track(en.journey.educationTrack);
    const items = within(formation).getAllByRole("listitem");
    expect(items).toHaveLength(education.length);
    expect(within(formation).getAllByRole("link")).toHaveLength(education.filter((e) => e.href).length);
    expect(within(formation).getByText("2022 – 2025")).toBeInTheDocument();
    expect(within(formation).getByText("2020")).toBeInTheDocument();
    expect(within(formation).getByText(education[0].detail!.en)).toBeInTheDocument();
    expect(screen.getByText("November 2025 → today", { exact: false })).toBeInTheDocument();
  });

  it("formats a period spanning two years", () => {
    const unmount = renderIsolated(
      () => ({ component: require("../../../src/components/journeySection").default }),
      {
        "../../../src/data/projects": () => {
          const actual = jest.requireActual("../../../src/data/projects");
          return {
            ...actual,
            projects: [{ ...actual.projects[1], period: { status: "completed", start: "2024-11", end: "2025-02" } }],
          };
        },
      },
    );
    expect(screen.getByText("novembre 2024 – février 2025")).toBeInTheDocument();
    unmount();
  });
});
