import fs from "node:fs";
import path from "node:path";
import { education } from "./education";
import { localizeProject, projects, type Project } from "./projects";
import manifest from "./imageManifest.json";

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

describe("projects", () => {
  it("have unique routes and exactly one featured card", () => {
    const hrefs = projects.map((p) => p.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(projects.filter((p: Project) => p.featured)).toHaveLength(1);
  });

  it.each(projects.map((p) => [p.href, p] as const))("%s has a page and well-formed fields", (href, p: Project) => {
    expect(fs.existsSync(path.join(process.cwd(), "src", "app", href, "page.tsx"))).toBe(true);
    expect(p.title.fr && p.title.en).toBeTruthy();
    expect(p.description.fr && p.description.en).toBeTruthy();
    expect(["pro", "recherche", "ecole", "perso"]).toContain(p.category);
    if (p.period) {
      expect(p.period.start).toMatch(MONTH);
      if (p.period.status === "completed") {
        expect(p.period.end).toMatch(MONTH);
        expect(p.period.end >= p.period.start).toBe(true);
      }
    }
  });

  it("localizeProject resolves every bilingual field", () => {
    const withExtras = projects.find((p: Project) => p.role && p.result) as Project;
    const en = localizeProject(withExtras, "en");
    expect(en.title).toBe(withExtras.title.en);
    expect(en.description).toBe(withExtras.description.en);
    expect(en.role).toBe(withExtras.role?.en);
    expect(en.result).toBe(withExtras.result?.en);

    const bare = projects.find((p: Project) => !p.role && !p.result) as Project;
    const fr = localizeProject(bare, "fr");
    expect(fr.title).toBe(bare.title.fr);
    expect(fr.role).toBeUndefined();
    expect(fr.result).toBeUndefined();
    expect(fr.href).toBe(bare.href);
  });
});

describe("education", () => {
  it("is in reverse chronological order with consistent years", () => {
    education.forEach((e) => expect(e.years.end).toBeGreaterThanOrEqual(e.years.start));
    for (let i = 1; i < education.length; i++) {
      expect(education[i - 1].years.start).toBeGreaterThanOrEqual(education[i].years.start);
    }
  });

  it("links only to existing routes", () => {
    education
      .filter((e) => e.href)
      .forEach((e) => expect(projects.some((p) => p.href === e.href)).toBe(true));
  });
});

describe("imageManifest", () => {
  it("is a non-empty object", () => {
    expect(Object.keys(manifest).length).toBeGreaterThan(0);
  });
});
