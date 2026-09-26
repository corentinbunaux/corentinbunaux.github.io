/** The two languages the site can display. Client-side toggle only — no
 * `/fr`/`/en` routes (see `docs/CADRAGE.md`), so this never affects routing
 * or static export. */
export type Language = "fr" | "en";

/** A piece of displayed text with both language variants. Used both by the
 * UI dictionary (`src/i18n/dictionary.ts`) and by the bilingual fields of
 * `src/data/projects.ts`. */
export interface LocalizedText {
  readonly fr: string;
  readonly en: string;
}
