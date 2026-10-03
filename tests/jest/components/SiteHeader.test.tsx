import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NAV_SECTION_IDS, SiteHeader } from "../../../src/components/SiteHeader";
import { dictionary } from "../../../src/i18n/dictionary";
import { FakeIntersectionObserver } from "../test-utils/browser";
import { renderWithProviders } from "../test-utils/render";

const fr = dictionary.fr;
const en = dictionary.en;

function HomeSections() {
  return (
    <>
      {NAV_SECTION_IDS.map((id) => (
        <section key={id} id={id} />
      ))}
    </>
  );
}

function renderHome(options = {}) {
  return renderWithProviders(
    <>
      <SiteHeader variant="home" />
      <HomeSections />
    </>,
    options,
  );
}

const nav = (t = fr) => screen.getByRole("navigation", { name: t.header.mainNavLabel });

describe("SiteHeader — home variant", () => {
  it("links to the four sections with same-page anchors", () => {
    renderHome();
    const links = within(nav()).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([fr.common.profile, fr.navbar.experiences, fr.common.projects, fr.common.about]);
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["#home", "#journey", "#portfolio", "#about"]);
    expect(screen.getByRole("link", { name: fr.header.homeLink })).toHaveAttribute("href", "#home");
    expect(links.some((l) => l.hasAttribute("aria-current"))).toBe(false);
  });

  it("highlights the section crossing the middle of the viewport, and keeps it when none does", () => {
    renderHome();
    const observer = FakeIntersectionObserver.instances[0];
    expect(observer.observed.map((el) => el.id)).toEqual([...NAV_SECTION_IDS]);

    act(() =>
      observer.report([
        { target: document.getElementById("home")!, isIntersecting: false },
        { target: document.getElementById("portfolio")!, isIntersecting: true },
      ]),
    );
    const current = within(nav()).getByRole("link", { name: fr.common.projects });
    expect(current).toHaveAttribute("aria-current", "location");
    expect(current).toHaveClass("text-my-green");

    act(() => observer.report([{ target: document.getElementById("portfolio")!, isIntersecting: false }]));
    expect(within(nav()).getByRole("link", { name: fr.common.projects })).toHaveAttribute("aria-current", "location");
  });

  it("disconnects its observer on unmount", () => {
    const { unmount } = renderHome();
    unmount();
    expect(FakeIntersectionObserver.instances[0].disconnected).toBe(true);
  });

  it("fails loudly when a home section is missing", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderWithProviders(<SiteHeader variant="home" />)).toThrow(
      "SiteHeader: missing section(s) #home, #journey, #portfolio, #about on the home page.",
    );
  });
});

describe("SiteHeader — project variant", () => {
  it("links back to the home page and marks Projects as current, without observing", () => {
    renderWithProviders(<SiteHeader variant="project" />);
    const links = within(nav()).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual(["/#home", "/#journey", "/#portfolio", "/#about"]);
    expect(within(nav()).getByRole("link", { name: fr.common.projects })).toHaveAttribute("aria-current", "location");
    expect(FakeIntersectionObserver.instances).toHaveLength(0);
  });
});

describe("SiteHeader — language menu", () => {
  const languageButton = (t = fr) => screen.getByRole("button", { name: new RegExp(`^${t.header.languageButtonLabel}`) });

  it("opens, switches to English, persists and closes, returning focus", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SiteHeader variant="project" />);
    const button = languageButton();
    expect(button).toHaveAccessibleName(`${fr.header.languageButtonLabel} (Français)`);
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Français" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "English" }));
    expect(screen.queryByRole("button", { name: "English" })).not.toBeInTheDocument();
    const enButton = languageButton(en);
    expect(enButton).toHaveAccessibleName(`${en.header.languageButtonLabel} (English)`);
    expect(enButton).toHaveFocus();
    expect(window.localStorage.getItem("corentinbunaux.language")).toBe("en");
    expect(within(nav(en)).getByRole("link", { name: en.navbar.experiences })).toBeInTheDocument();
  });

  it("closes on Escape (refocusing the button) and on an outside click, not on an inside one", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <SiteHeader variant="project" />
        <p>outside</p>
      </>,
    );
    const button = languageButton();

    await user.click(button);
    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();

    await user.click(button);
    await user.keyboard("a"); // other keys do nothing
    await user.pointer({ keys: "[MouseLeft]", target: screen.getByRole("button", { name: "Français" }).parentElement! });
    expect(button).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByText("outside"));
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles closed when the button is clicked again", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SiteHeader variant="project" />);
    await user.click(languageButton());
    await user.click(languageButton());
    expect(languageButton()).toHaveAttribute("aria-expanded", "false");
  });
});

describe("SiteHeader — theme toggle", () => {
  it("offers the opposite theme and switches the page theme", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SiteHeader variant="project" />, { theme: "dark" });
    const toggle = screen.getByRole("button", { name: fr.header.themeToLight });
    expect(toggle.querySelector(".lucide-moon")).not.toBeNull();
    await user.click(toggle);
    expect(document.documentElement.dataset.theme).toBe("light");
    const back = screen.getByRole("button", { name: fr.header.themeToDark });
    expect(back.querySelector(".lucide-sun")).not.toBeNull();
    expect(back).toHaveAttribute("title", fr.header.themeToDark);
  });
});
