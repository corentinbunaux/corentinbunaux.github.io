import fs from "node:fs";
import { loadArticle, parseArticle } from "../../../src/lib/articles";
import { projects } from "../../../src/data/projects";

describe("parseArticle", () => {
  it("splits sections on '## ' and joins wrapped lines into paragraphs", () => {
    const md = [
      "",
      "## Contexte",
      "Première ligne",
      "suite de la ligne.",
      "",
      "Second paragraphe.",
      "## Résultat  ",
      "Fin.",
    ].join("\r\n");
    expect(parseArticle(md, "x.md")).toEqual([
      { title: "Contexte", paragraphs: ["Première ligne suite de la ligne.", "Second paragraphe."] },
      { title: "Résultat", paragraphs: ["Fin."] },
    ]);
  });

  it("rejects a heading with no title (trailing spaces are trimmed first)", () => {
    expect(() => parseArticle("##   \ntext", "a.md")).toThrow("a.md:1:");
  });

  it("rejects other heading levels", () => {
    expect(() => parseArticle("## Ok\n### Sub", "a.md")).toThrow('a.md:2: only "## " headings are supported.');
    expect(() => parseArticle("# Title", "a.md")).toThrow("a.md:1");
  });

  it("rejects text before the first heading", () => {
    expect(() => parseArticle("intro\n## A\nb", "a.md")).toThrow('a.md:1: text before the first "## " heading.');
  });

  it("rejects a file with no section", () => {
    expect(() => parseArticle("\n\n", "a.md")).toThrow('a.md: no "## " section.');
  });

  it("rejects a section with no text", () => {
    expect(() => parseArticle("## A\n\n## B\ntext", "a.md")).toThrow('a.md: section "A" has no text.');
  });
});

describe("loadArticle", () => {
  it.each(projects.map((p) => p.href))("loads %s in both languages with aligned sections", (href) => {
    const article = loadArticle(href);
    expect(article.fr.length).toBeGreaterThan(0);
    expect(article.fr.length).toBe(article.en.length);
  });

  it("throws when FR and EN have a different number of sections", () => {
    const spy = jest
      .spyOn(fs, "readFileSync")
      .mockImplementation(((file: string) =>
        String(file).endsWith(".fr.md") ? "## A\nx\n## B\ny" : "## A\nx") as typeof fs.readFileSync);
    try {
      expect(() => loadArticle("fake")).toThrow(
        "content/projects/fake: 2 FR sections vs 1 EN sections — keep both languages aligned.",
      );
    } finally {
      spy.mockRestore();
    }
  });
});
