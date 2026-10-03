import { screen, within } from "@testing-library/react";
import { ProjectPage } from "../../../src/components/ProjectPage";
import { projects, type Project } from "../../../src/data/projects";
import { loadArticle } from "../../../src/lib/articles";
import type { Article } from "../../../src/lib/articleTypes";
import { dictionary } from "../../../src/i18n/dictionary";
import { setDesktop } from "../test-utils/browser";
import { renderWithProviders } from "../test-utils/render";

const fr = dictionary.fr;
const en = dictionary.en;

const byHref = (href: string) => projects.find((p) => p.href === href) as Project;
const article: Article = {
  fr: [
    { title: "Contexte", paragraphs: ["Premier paragraphe.", "Second paragraphe."] },
    { title: "Travail", paragraphs: ["Détail."] },
  ],
  en: [
    { title: "Context", paragraphs: ["First paragraph.", "Second paragraph."] },
    { title: "Work", paragraphs: ["Detail."] },
  ],
};

function renderPage(project: Project, options: { language?: "fr" | "en" } = {}, a: Article = article) {
  return renderWithProviders(<ProjectPage project={project} article={a} />, options);
}

function enBref() {
  return screen.getByRole("complementary", { name: fr.projectPage.enBref });
}

function fact(label: string) {
  const dt = within(enBref()).getByText(label);
  return dt.nextElementSibling?.textContent;
}

describe("ProjectPage", () => {
  beforeEach(() => setDesktop(false));

  it("renders header, breadcrumb, numbered article sections and the project-variant site header", () => {
    renderPage(byHref("work/gcii"));
    const project = byHref("work/gcii");
    expect(screen.getByRole("heading", { level: 1, name: project.title.fr })).toBeInTheDocument();
    expect(screen.getByText(project.description.fr)).toBeInTheDocument();

    const breadcrumb = screen.getByRole("navigation", { name: fr.projectPage.breadcrumbLabel });
    expect(within(breadcrumb).getByRole("link", { name: fr.projectPage.home })).toHaveAttribute("href", "/");
    expect(within(breadcrumb).getByText(project.title.fr)).toHaveAttribute("aria-current", "page");

    const sections = screen.getAllByRole("region").filter((r) => /^section-\d-heading$/.test(r.getAttribute("aria-labelledby") ?? ""));
    expect(sections).toHaveLength(2);
    expect(within(sections[0]).getByText("01")).toBeInTheDocument();
    expect(within(sections[0]).getByRole("heading", { name: "Contexte" })).toBeInTheDocument();
    expect(within(sections[0]).getAllByText(/paragraphe/)).toHaveLength(2);

    // Site header in project mode: links go back to the home page.
    const mainNav = screen.getByRole("navigation", { name: fr.header.mainNavLabel });
    expect(within(mainNav).getByRole("link", { name: fr.common.projects })).toHaveAttribute("href", "/#portfolio");
  });

  it("summarises role, ongoing duration, stack and result for the current job", () => {
    renderPage(byHref("work/gcii"));
    const project = byHref("work/gcii");
    expect(fact(fr.projectPage.role)).toBe(project.role!.fr);
    expect(fact(fr.projectPage.duration)).toBe("Depuis novembre 2025");
    expect(fact(fr.projectPage.stack)).toBe("Python, React, Git, TypeScript, Copilot CLI");
    expect(fact(fr.projectPage.result)).toBe(project.result!.fr);
    expect(within(enBref()).queryByText(fr.projectPage.team)).not.toBeInTheDocument();
    expect(within(enBref()).queryByRole("link")).not.toBeInTheDocument(); // no repo
    expect(within(enBref()).queryByRole("img")).not.toBeInTheDocument(); // no entity logo
  });

  it("counts completed durations in months, singular for one", () => {
    const { unmount } = renderPage(byHref("internships/safran"));
    expect(fact(fr.projectPage.duration)).toBe("6 mois");
    unmount();
    renderPage(byHref("internships/kusmitea"), { language: "en" });
    expect(within(screen.getByRole("complementary", { name: en.projectPage.enBref })).getByText(en.projectPage.duration).nextElementSibling).toHaveTextContent(`1 ${en.projectPage.monthSingular}`);
  });

  it("shows the entity logo, the repository link and the team when known; hides empty facts", () => {
    const sncf = { ...byHref("research/sncf"), team: "Binôme" } as Project;
    renderPage(sncf);
    expect(fact(fr.projectPage.team)).toBe("Binôme");
    expect(within(enBref()).getByRole("img", { name: `${fr.projectPage.logoLabel} ${sncf.title.fr}` })).toBeInTheDocument();
    const repo = within(enBref()).getByRole("link", { name: fr.projectPage.viewRepo });
    expect(repo).toHaveAttribute("href", sncf.githubRepo);
    expect(repo).toHaveAttribute("rel", "noopener noreferrer");
    expect(within(enBref()).queryByText(fr.projectPage.duration)).not.toBeInTheDocument();
  });

  it("hides the stack and visual when a project has neither", () => {
    const bare = { ...byHref("internships/kusmitea"), img: null } as Project;
    renderPage(bare);
    expect(within(enBref()).queryByText(fr.projectPage.stack)).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: `${fr.projectPage.visualAltPrefix}${bare.title.fr}` })).not.toBeInTheDocument();
  });

  it("shows the main visual, tech badges and the photo gallery", () => {
    const tipe = byHref("cpge_tipe");
    renderPage(tipe);
    expect(screen.getByRole("img", { name: `${fr.projectPage.visualAltPrefix}${tipe.title.fr}` })).toHaveAttribute("loading", "eager");
    const gallery = screen.getByRole("region", { name: fr.projectPage.gallery });
    expect(within(gallery).getAllByRole("img")).toHaveLength(tipe.photos.length);
    expect(within(gallery).getByRole("img", { name: `${tipe.title.fr} — ${fr.projectPage.photoLabel} 1` })).toBeInTheDocument();
  });

  it("links to the previous and next projects, with none before the first or after the last", () => {
    const { unmount } = renderPage(projects[0]);
    const between = () => screen.getByRole("navigation", { name: fr.projectPage.navBetweenProjects });
    expect(within(between()).getAllByRole("link")).toHaveLength(1);
    expect(within(between()).getByRole("link")).toHaveAttribute("href", `/${projects[1].href}`);
    unmount();

    const { unmount: unmountMiddle } = renderPage(projects[3]);
    const links = within(between()).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([`/${projects[2].href}`, `/${projects[4].href}`]);
    expect(links[0]).toHaveTextContent(fr.projectPage.prevProject);
    unmountMiddle();

    renderPage(projects[projects.length - 1], { language: "en" });
    const last = within(screen.getByRole("navigation", { name: en.projectPage.navBetweenProjects })).getAllByRole("link");
    expect(last).toHaveLength(1);
    expect(last[0]).toHaveTextContent(en.projectPage.prevProject);
  });

  it("has no neighbours for a project outside the list", () => {
    renderPage({ ...projects[0], href: "nowhere" } as Project);
    expect(within(screen.getByRole("navigation", { name: fr.projectPage.navBetweenProjects })).queryAllByRole("link")).toHaveLength(0);
  });

  it("renders the article in English, with the demo section numbered after it and the inline visual after section 1", async () => {
    const sncf = byHref("research/sncf");
    const real = loadArticle(sncf.href);
    const { container } = renderPage(sncf, { language: "en" }, real);
    expect(screen.getByRole("heading", { level: 1, name: sncf.title.en })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: real.en[0].title })).toBeInTheDocument();
    const demo = screen.getByRole("region", { name: en.demos.sectionTitle });
    expect(within(demo).getByText(String(real.en.length + 1).padStart(2, "0"))).toBeInTheDocument();
    // Inline visual (the mini train) sits right after the first section.
    const firstSection = screen.getByRole("heading", { name: real.en[0].title }).closest("section")!;
    expect(firstSection.nextElementSibling).toHaveTextContent(en.demos.items["sncf-mini-train"].caption);
    expect(container.querySelector(".project-page")).not.toBeNull();
  });
});
