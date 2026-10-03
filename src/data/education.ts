import type { Language, LocalizedText } from "../i18n/types";

/** Whole years. A single-year milestone (the baccalauréat) has start === end. */
export interface EducationYears {
  readonly start: number;
  readonly end: number;
}

export interface EducationEntry {
  readonly id: string;
  readonly title: LocalizedText;
  /** Proper nouns: not translated (same rule as `Project.location`). */
  readonly institution: string;
  readonly location: string;
  readonly years: EducationYears;
  readonly detail?: LocalizedText;
  /** Route without a leading slash, when the entry has a page (e.g. the TIPE). */
  readonly href?: string;
}

/** `EducationEntry`, with every `LocalizedText` field resolved to a plain
 * string for one language — mirrors `localizeProject()` in `src/data/projects.ts`
 * so both bilingual data sources are resolved the same way. */
export type LocalizedEducationEntry = Omit<EducationEntry, "title" | "detail"> & {
  readonly title: string;
  readonly detail?: string;
};

/** Resolves every bilingual field of `entry` to the given `language`. */
export function localizeEducation(entry: EducationEntry, language: Language): LocalizedEducationEntry {
  return {
    ...entry,
    title: entry.title[language],
    detail: entry.detail ? entry.detail[language] : undefined,
  };
}

export const education: readonly EducationEntry[] = [
  {
    id: "mines",
    title: {
      fr: "Diplôme d'ingénieur — cursus ISMIN",
      en: "Engineering degree — ISMIN track",
    },
    detail: {
      fr: "Ingénieur spécialité Microélectronique et Informatique",
      en: "Engineering specialty in Microelectronics and Computer Science",
    },
    institution: "École des Mines de Saint-Étienne",
    location: "Gardanne",
    years: { start: 2022, end: 2025 },
  },
  {
    id: "cpge-psi",
    title: {
      fr: "Classe préparatoire PSI",
      en: "Preparatory class PSI (CPGE)",
    },
    institution: "Lycée Victor Hugo",
    location: "Caen",
    years: { start: 2021, end: 2022 },
    href: "cpge_tipe",
  },
  {
    id: "cpge-pcsi",
    title: {
      fr: "Classe préparatoire PCSI",
      en: "Preparatory class PCSI (CPGE)",
    },
    institution: "Lycée François Ier",
    location: "Le Havre",
    years: { start: 2020, end: 2021 },
    href: "cpge_tipe",
  },
  {
    id: "bac",
    title: {
      fr: "Baccalauréat S — mention Très bien",
      en: "Baccalauréat, science track — highest honours",
    },
    detail: {
      fr: "Spécialité Mathématiques",
      en: "Mathematics specialty",
    },
    institution: "Lycée Guillaume Le Conquérant",
    location: "Lillebonne",
    years: { start: 2020, end: 2020 },
  },
];
