import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectsSection from "../../../src/components/projectsSection";
import { projects, type Project } from "../../../src/data/projects";
import { dictionary } from "../../../src/i18n/dictionary";
import { renderWithProviders } from "../test-utils/render";
import { renderIsolated } from "../test-utils/isolated";

const fr = dictionary.fr;
const excerpts = { "work/gcii": { fr: "Extrait FR", en: "Excerpt EN" } };

const cards = () =>
  within(screen.getByRole("group", { name: fr.projects.filterGroupLabel }).parentElement!)
    .getAllByRole("link")
    .map((a) => a.getAttribute("href"));

describe("ProjectsSection", () => {
  it("shows every project, the featured one first and double-width", () => {
    renderWithProviders(<ProjectsSection excerpts={excerpts} />);
    const hrefs = cards();
    expect(hrefs).toHaveLength(projects.length);
    expect(hrefs[0]).toBe("/work/gcii");
    expect(screen.getAllByRole("link")[0]).toHaveClass("sm:col-span-2");
    expect(screen.getByText("Extrait FR")).toBeInTheDocument();
  });

  it("filters by category and marks the active pill", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectsSection excerpts={{}} />);
    const all = screen.getByRole("button", { name: fr.projects.filters.all });
    expect(all).toHaveAttribute("aria-pressed", "true");

    for (const category of ["pro", "recherche", "ecole", "perso"] as const) {
      const pill = screen.getByRole("button", { name: fr.projects.filters[category] });
      await user.click(pill);
      expect(pill).toHaveAttribute("aria-pressed", "true");
      expect(all).toHaveAttribute("aria-pressed", "false");
      const expected = projects.filter((p: Project) => p.category === category).map((p) => `/${p.href}`);
      expect(cards().sort()).toEqual(expected.sort());
    }
  });

  it("shows titles, descriptions and excerpts in English", () => {
    renderWithProviders(<ProjectsSection excerpts={excerpts} />, { language: "en" });
    const gcii = projects[0];
    expect(screen.getByRole("heading", { name: gcii.title.en })).toBeInTheDocument();
    expect(screen.getByText(gcii.description.en)).toBeInTheDocument();
    expect(screen.getByText("Excerpt EN")).toBeInTheDocument();
  });

  it("renders one tech pill per known logo", () => {
    renderWithProviders(<ProjectsSection excerpts={{}} />);
    const card = screen.getAllByRole("link")[0];
    expect(card.querySelectorAll("span[title]")).toHaveLength(projects[0].techLogos.length);
  });
});

describe("ProjectsSection with incomplete data", () => {
  it("shows a placeholder without an image, and silently skips an unknown logo", () => {
    const unmount = renderIsolated(
      () => ({ component: require("../../../src/components/projectsSection").default, props: { excerpts: {} } }),
      {
        // Path relative to tests/jest/test-utils/isolated.ts.
        "../../../src/data/projects": () => {
          const actual = jest.requireActual("../../../src/data/projects");
          return {
            ...actual,
            projects: [{ ...actual.projects[1], img: null, techLogos: ["react", "fortran"] }],
          };
        },
      },
    );
    expect(screen.getByText(fr.projects.previewComing)).toBeInTheDocument();
    expect(screen.getByRole("link").querySelectorAll("span[title]")).toHaveLength(1);
    unmount();
  });
});
