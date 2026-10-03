import { screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { projects } from "../data/projects";
import { loadArticle } from "../lib/articles";
import { dictionary } from "../i18n/dictionary";
import { THEME_INIT_SCRIPT } from "../theme/themeScript";
import { NAV_SECTION_IDS } from "../components/SiteHeader";
import { setDesktop, navTiming } from "../test-utils/browser";
import { renderWithProviders } from "../test-utils/render";
import { renderIsolated } from "../test-utils/isolated";
import { replaceLocation } from "../lib/navigation";
import RootLayout, { metadata } from "./layout";
import Home from "./page";

jest.mock("../lib/navigation", () => ({ replaceLocation: jest.fn() }));

const PAGES: Record<string, () => { default: ComponentType }> = {
  "work/gcii": () => require("./work/gcii/page"),
  "internships/safran": () => require("./internships/safran/page"),
  "internships/quimesis": () => require("./internships/quimesis/page"),
  "internships/kusmitea": () => require("./internships/kusmitea/page"),
  "research/sncf": () => require("./research/sncf/page"),
  "personnal/cctv": () => require("./personnal/cctv/page"),
  "personnal/web": () => require("./personnal/web/page"),
  "emse/android": () => require("./emse/android/page"),
  "emse/minesweeper": () => require("./emse/minesweeper/page"),
  "emse/programming": () => require("./emse/programming/page"),
  "emse/embedded": () => require("./emse/embedded/page"),
  cpge_tipe: () => require("./cpge_tipe/page"),
};

beforeEach(() => setDesktop(false));

describe("project routes", () => {
  it("has one route per project", () => {
    expect(Object.keys(PAGES).sort()).toEqual(projects.map((p) => p.href).sort());
  });

  it.each(Object.keys(PAGES))("%s renders its project page with its article", (href) => {
    const Page = PAGES[href]().default;
    const project = projects.find((p) => p.href === href)!;
    renderWithProviders(<Page />);
    expect(screen.getByRole("heading", { level: 1, name: project.title.fr })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: loadArticle(href).fr[0].title })).toBeInTheDocument();
  });

  it.each(Object.keys(PAGES))("%s fails the build if its data entry disappears", (href) => {
    expect(() =>
      renderIsolated(() => ({ component: PAGES[href]().default }), {
        "../data/projects": () => ({ ...jest.requireActual<object>("../data/projects"), projects: [] }),
      }),
    ).toThrow(`Project "${href}" not found in src/data/projects.ts.`);
  });
});

describe("home page", () => {
  it("renders every section with the first paragraph of each article as excerpt", () => {
    navTiming.set("navigate");
    const { container } = renderWithProviders(<Home />);
    for (const id of NAV_SECTION_IDS) expect(container.querySelector(`section#${id}`)).not.toBeNull();
    expect(container.querySelector("section#footer footer")).not.toBeNull();
    const gcii = loadArticle("work/gcii");
    expect(screen.getByText(gcii.fr[0].paragraphs[0])).toBeInTheDocument();
    expect(replaceLocation).not.toHaveBeenCalled();
  });

  it("replaces the URL on a reload of the home page", () => {
    // Fresh module registry (PORT-069): HomeShell's `reloadHandled` flag is
    // module-scoped and sticks at `true` for the process's lifetime, so a
    // shared `Home` import here would always see it already flipped by the
    // first test above. `jest.mock` above still applies inside the isolated
    // registry (it intercepts module resolution, not a specific instance).
    navTiming.set("reload", "/");
    const unmount = renderIsolated(() => ({ component: require("./page").default }), {});
    expect(replaceLocation).toHaveBeenCalledWith("/");
    expect(screen.getByRole("navigation", { name: dictionary.fr.header.mainNavLabel })).toBeInTheDocument();
    unmount();
  });

  it("falls back to empty excerpts for an article without sections", () => {
    navTiming.set("navigate");
    const unmount = renderIsolated(() => ({ component: require("./page").default }), {
      "../lib/articles": () => ({ loadArticle: () => ({ fr: [], en: [] }) }),
    });
    expect(screen.getAllByRole("heading", { level: 3 }).length).toBeGreaterThan(0);
    expect(screen.queryByText(loadArticle("work/gcii").fr[0].paragraphs[0])).toBeNull();
    unmount();
  });
});

describe("root layout", () => {
  it("wraps pages in the providers and inlines the theme script before hydration", () => {
    expect(metadata.title).toBe("Portfolio - Corentin Bunaux");
    const html = renderToStaticMarkup(
      <RootLayout>
        <p>child</p>
      </RootLayout>,
    );
    expect(html).toMatch(/^<html lang="fr">/);
    expect(html).toContain(`<script>${THEME_INIT_SCRIPT}</script>`);
    expect(html).toContain("<body><p>child</p></body>");
  });
});
