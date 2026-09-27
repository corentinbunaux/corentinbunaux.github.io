import type { Language } from "../i18n/types";

export interface ArticleSection {
  readonly title: string;
  readonly paragraphs: readonly string[];
}

/** One project's article in both languages, same number of sections. */
export type Article = Readonly<Record<Language, readonly ArticleSection[]>>;
