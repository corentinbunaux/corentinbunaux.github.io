import { readFileSync } from "node:fs";
import path from "node:path";
import type { Language } from "../i18n/types";
import type { Article, ArticleSection } from "./articleTypes";

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

/** Parses the tiny Markdown subset documented in content/projects/README.md.
 * Throws with file:line on anything outside it, so a typo fails the build. */
export function parseArticle(markdown: string, source: string): ArticleSection[] {
  const sections: { title: string; lines: string[] }[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  lines.forEach((rawLine, index) => {
    const line = rawLine.trimEnd();
    const where = `${source}:${index + 1}`;
    if (line.startsWith("## ")) {
      const title = line.slice(3).trim();
      // Coverage: unreachable today — `line` is trimEnd()-ed, so "## " only
      // matches when a non-space character follows; kept as a guard (PORT-068).
      /* istanbul ignore if */
      if (!title) throw new Error(`${where}: empty "## " heading.`);
      sections.push({ title, lines: [] });
      return;
    }
    if (line.startsWith("#")) {
      throw new Error(`${where}: only "## " headings are supported.`);
    }
    if (sections.length === 0) {
      if (line.trim() === "") return;
      throw new Error(`${where}: text before the first "## " heading.`);
    }
    sections[sections.length - 1].lines.push(line);
  });

  if (sections.length === 0) throw new Error(`${source}: no "## " section.`);

  return sections.map(({ title, lines: body }) => {
    const paragraphs = body
      .join("\n")
      .split(/\n\s*\n/)
      .map((block) => block.split("\n").map((l) => l.trim()).join(" ").trim())
      .filter((paragraph) => paragraph.length > 0);
    if (paragraphs.length === 0) {
      throw new Error(`${source}: section "${title}" has no text.`);
    }
    return { title, paragraphs };
  });
}

/** Reads content/projects/<href>.fr.md and .en.md at build time. */
export function loadArticle(href: string): Article {
  const read = (language: Language) => {
    const file = path.join(CONTENT_DIR, `${href}.${language}.md`);
    const source = path.relative(process.cwd(), file);
    return parseArticle(readFileSync(file, "utf8"), source);
  };
  const fr = read("fr");
  const en = read("en");
  if (fr.length !== en.length) {
    throw new Error(
      `content/projects/${href}: ${fr.length} FR sections vs ${en.length} EN sections — keep both languages aligned.`,
    );
  }
  return { fr, en };
}
