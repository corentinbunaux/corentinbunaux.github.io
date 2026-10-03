import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Footer from "./footer";
import Homepage, { GithubLogo } from "./homepage";
import AboutMe from "./aboutmeSection";
import { dictionary } from "../i18n/dictionary";
import { REDUCED_MOTION_QUERY, media, setDesktop } from "../test-utils/browser";
import { renderWithProviders } from "../test-utils/render";
import { render } from "@testing-library/react";

/** jsdom has no AnimationEvent: fireEvent would drop `animationName`. */
function animationEnd(target: Element, animationName: string) {
  const event = new Event("animationend", { bubbles: true });
  Object.defineProperty(event, "animationName", { value: animationName });
  act(() => {
    target.dispatchEvent(event);
  });
}

const fr = dictionary.fr;
const en = dictionary.en;

describe("Footer", () => {
  it("offers contact links and points only at real routes", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole("heading", { name: fr.footer.workTogether })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: fr.footer.contactCta })).toHaveAttribute("href", "mailto:corentin.bunaux@gmail.com");

    const projectsNav = screen.getByRole("navigation", { name: fr.common.projects });
    expect(within(projectsNav).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([
      "/internships/safran",
      "/internships/quimesis",
      "/research/sncf",
      "/personnal/cctv",
    ]);
    const siteNav = screen.getByRole("navigation", { name: fr.footer.navHeading });
    expect(within(siteNav).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(["#home", "#portfolio", "#about"]);

    for (const link of screen.getAllByRole("link", { name: /LinkedIn|GitHub/ })) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(screen.getByText(`© ${new Date().getFullYear()} Corentin Bunaux`)).toBeInTheDocument();
  });

  it("is translated", () => {
    renderWithProviders(<Footer />, { language: "en" });
    expect(screen.getByRole("heading", { name: en.footer.workTogether })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: en.footer.emailLabel })).toBeInTheDocument();
  });
});

describe("Homepage (hero)", () => {
  it("introduces Corentin with CTAs, social links and his stack", () => {
    setDesktop(false);
    renderWithProviders(<Homepage />);
    expect(screen.getByRole("heading", { level: 1, name: "Corentin Bunaux" })).toBeInTheDocument();
    expect(screen.getByText(fr.hero.tagline)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: fr.hero.cta })).toHaveAttribute("href", "#portfolio");
    expect(screen.getByRole("link", { name: fr.hero.linkedinLabel })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: fr.hero.githubLabel })).toHaveAttribute("href", "https://github.com/corentinbunaux");
    const stack = screen.getByText(fr.hero.stackLabel).nextElementSibling!;
    expect(within(stack as HTMLElement).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "TypeScript",
      "React",
      "Python",
      "Git",
      "Linux",
      "Copilot CLI",
    ]);
  });

  it("lists the employers from the pro and research projects, in the visitor's language", () => {
    setDesktop(false);
    renderWithProviders(<Homepage />, { language: "en" });
    const experience = screen.getByText(en.hero.experienceLabel, { exact: false });
    expect(experience.textContent).toContain("GCII / Enedis · Safran");
    expect(experience.textContent).toContain("SNCF");
    expect(experience.textContent).not.toContain("Minesweeper");
  });

  it("GithubLogo passes its class through", () => {
    const { container } = render(<GithubLogo className="h-6" />);
    expect(container.querySelector("svg")).toHaveClass("h-6");
  });
});

describe("AboutMe", () => {
  it("presents the interests, current and archived", () => {
    renderWithProviders(<AboutMe />);
    expect(screen.getByRole("heading", { name: fr.about.title })).toBeInTheDocument();
    const group = screen.getByRole("group", { name: fr.about.interestsLabel });
    const now = within(group).getByRole("list", { name: fr.about.activeLabel });
    expect(within(now).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      fr.about.interests.tennis,
      fr.about.interests.running,
      fr.about.interests.moviesMusic,
      fr.about.interests.code,
    ]);
    const before = within(group).getByRole("list", { name: fr.about.archivedLabel });
    expect(within(before).getAllByRole("listitem")).toHaveLength(4);
    expect(before.querySelector(".border-dashed")).not.toBeNull();
  });

  it("sends the ball to the racket, then retires the button when the animation ends", async () => {
    const { container } = renderWithProviders(<AboutMe />);
    const button = screen.getByRole("button", { name: fr.about.pushButton });
    await userEvent.click(button);

    const aimWrapper = container.querySelector(".ball-aim") as HTMLElement;
    expect(aimWrapper).not.toBeNull();
    expect(aimWrapper.style.getPropertyValue("--ball-aim-x")).toMatch(/px$/);
    const ball = container.querySelector(".ball") as HTMLElement;
    expect(button).not.toHaveClass("btn_federer-done");

    await userEvent.click(button); // already flying: ignored
    animationEnd(ball, "other");
    expect(button).not.toHaveClass("btn_federer-done");

    animationEnd(ball, "ball_path");
    expect(button).toHaveClass("btn_federer-done");
    expect(ball).toHaveClass("ball-struck");
  });

  it("ignores animation events bubbling from inside the ball", async () => {
    const { container } = renderWithProviders(<AboutMe />);
    await userEvent.click(screen.getByRole("button", { name: fr.about.pushButton }));
    const ball = container.querySelector(".ball") as HTMLElement;
    const child = document.createElement("span");
    ball.appendChild(child);
    animationEnd(child, "ball_path");
    expect(screen.getByRole("button", { name: fr.about.pushButton })).not.toHaveClass("btn_federer-done");
  });

  it("skips the flight under reduced motion", async () => {
    media.set(REDUCED_MOTION_QUERY, true);
    const { container } = renderWithProviders(<AboutMe />, { language: "en" });
    const button = screen.getByRole("button", { name: en.about.pushButton });
    await userEvent.click(button);
    expect(button).toHaveClass("btn_federer-done");
    expect(container.querySelector(".ball")).toBeNull();
  });
});
