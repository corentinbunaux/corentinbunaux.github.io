import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { DemoSection, InlineVisual } from "./DemoSection";
import { DEMOS } from "./registry";
import { projects } from "../../data/projects";
import { dictionary } from "../../i18n/dictionary";
import { setDesktop } from "../../test-utils/browser";
import { LIGHT_TOKENS, installThemeTokens, renderWithProviders } from "../../test-utils/render";
import { fakeLayout, renderers, resetRenderers } from "../../test-utils/three";
import { useTheme } from "../../theme/ThemeContext";

beforeEach(() => {
  resetRenderers();
  fakeLayout();
});

describe("registry", () => {
  it("only lists real project routes, with one dictionary entry per demo", () => {
    const hrefs = new Set(projects.map((p) => p.href));
    for (const [href, demos] of Object.entries(DEMOS)) {
      expect(hrefs.has(href)).toBe(true);
      for (const demo of demos) {
        expect(dictionary.fr.demos.items[demo.id].title).toBeTruthy();
        expect(dictionary.en.demos.items[demo.id].caption).toBeTruthy();
      }
    }
  });

  it.each(Object.values(DEMOS).flat().map((d) => [d.id, d] as const))(
    "%s: its lazily-loaded component mounts",
    async (_id, demo) => {
      setDesktop(true);
      const { container } = renderWithProviders(<demo.Component />);
      if (demo.kind === "3d") {
        await waitFor(() => expect(container.querySelector("canvas")).not.toBeNull());
      } else {
        await waitFor(() => expect(container.firstElementChild).not.toBeNull());
      }
    },
  );
});

describe("DemoSection", () => {
  it("renders nothing for a project without demos", () => {
    const { container } = renderWithProviders(<DemoSection href="personnal/web" number={4} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("numbers the section and lists every 'demo' entry with its title and caption", async () => {
    renderWithProviders(<DemoSection href="emse/programming" number={3} />);
    const section = screen.getByRole("region", { name: dictionary.fr.demos.sectionTitle });
    expect(within(section).getByText("03")).toBeInTheDocument();
    const titles = within(section)
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(titles).toEqual(["guards", "typing", "predict"].map((id) => dictionary.fr.demos.items[id].title));
    expect(screen.getByText(dictionary.fr.demos.items.guards.caption)).toBeInTheDocument();
    // 2D demos run everywhere, including mobile.
    expect(await screen.findByRole("grid")).toBeInTheDocument();
  });

  it("skips 'inline' entries (SNCF's mini train) in the numbered section", () => {
    renderWithProviders(<DemoSection href="research/sncf" number={5} />, { language: "en" });
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      dictionary.en.demos.items["sncf-spacetime"].title,
    ]);
  });

  it("shows the desktop-only notice for 3D demos on mobile", () => {
    setDesktop(false);
    renderWithProviders(<DemoSection href="cpge_tipe" number={2} />);
    expect(screen.getByText(dictionary.fr.demos.desktopOnly)).toBeInTheDocument();
    expect(renderers()).toHaveLength(0);
  });

  it("mounts 3D demos on desktop and rebuilds them on a theme change", async () => {
    setDesktop(true);
    function ThemeSwitch() {
      const { toggleTheme } = useTheme();
      return <button onClick={toggleTheme}>theme</button>;
    }
    const { container } = renderWithProviders(
      <>
        <ThemeSwitch />
        <DemoSection href="cpge_tipe" number={2} />
      </>,
    );
    await waitFor(() => expect(container.querySelector("canvas")).not.toBeNull());
    expect(screen.queryByText(dictionary.fr.demos.desktopOnly)).not.toBeInTheDocument();

    installThemeTokens(LIGHT_TOKENS);
    fireEvent.click(screen.getByRole("button", { name: "theme" }));
    await waitFor(() => expect(renderers()).toHaveLength(2));
    expect(renderers()[0].disposed).toBe(true);
  });
});

describe("InlineVisual", () => {
  it("renders nothing without an inline demo", () => {
    const { container } = renderWithProviders(<InlineVisual href="emse/minesweeper" />);
    expect(container).toBeEmptyDOMElement();
    const { container: unknown } = renderWithProviders(<InlineVisual href="nope" />);
    expect(unknown).toBeEmptyDOMElement();
  });

  it("shows a 2D inline visual with its caption everywhere", async () => {
    setDesktop(false);
    const { container } = renderWithProviders(<InlineVisual href="research/sncf" />);
    expect(screen.getByText(dictionary.fr.demos.items["sncf-mini-train"].caption)).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector(".sncf-mini-train")).not.toBeNull());
  });

  it("keeps the 3D inline box empty and uncaptioned off desktop", () => {
    setDesktop(false);
    const { container } = renderWithProviders(<InlineVisual href="internships/safran" />);
    expect(container.querySelector(".aspect-video")).toBeEmptyDOMElement();
    expect(screen.queryByText(dictionary.fr.demos.items["safran-earth"].caption)).not.toBeInTheDocument();
  });

  it("mounts the 3D inline visual and its caption on desktop", async () => {
    setDesktop(true);
    const { container } = renderWithProviders(<InlineVisual href="internships/safran" />);
    expect(screen.getByText(dictionary.fr.demos.items["safran-earth"].caption)).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector("canvas")).not.toBeNull());
  });
});
