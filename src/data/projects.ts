/**
 * Single source of truth for the portfolio's projects.
 *
 * Extracted from `src/components/projectsSection.jsx` (PORT-008). Both the
 * portfolio grid (`projectsSection.jsx`) and the project page
 * (`project.tsx`) read from here.
 *
 * Bilingual fields (PORT-017): every field that holds real prose (`title`,
 * `description`, `role`, `result`) is a `LocalizedText` — an `{ fr, en }`
 * pair — rather than a plain string, so both languages live next to each
 * other in one file instead of a parallel `projects.en.ts` that could drift
 * out of sync. Consumers call `localizeProject(project, language)` to get
 * back the same flat shape the components used before this ticket
 * (`title: string`, etc.), which is what keeps `ProjectPage.tsx`,
 * `projectsSection.jsx` and `journeySection.tsx` simple to read from.
 *
 * The long-form article text (context + numbered sections) is not here: it
 * lives in `content/projects/<href>.<fr|en>.md`, read at build time by
 * `src/lib/articles.ts` (PORT-036) — see `content/projects/README.md`.
 */

import type { Language, LocalizedText } from "../i18n/types";

/**
 * Identifiers of the technology logos rendered by `bannerElmts` in
 * `src/components/Banner.jsx`. That module resolves each id and silently drops
 * the ones it does not know, so an unknown id would vanish without warning —
 * hence the closed union, which turns that silent drop into a type error.
 *
 * Keep in sync with `bannerElmts`.
 */
export type TechLogoId =
  | "html"
  | "css"
  | "javascript"
  | "react"
  | "typescript"
  | "kotlin"
  | "sql"
  | "python"
  | "java"
  | "cpp"
  | "arduino"
  | "windows"
  | "linux"
  | "office"
  | "git";

/**
 * When a project ran. Months are `YYYY-MM`.
 *
 * A discriminated union rather than an optional `end`: an ongoing project has
 * no end date, and a finished one always has one. Modelling it this way means
 * "finished but no end date" cannot be written down.
 */
export type ProjectPeriod =
  | { readonly status: "ongoing"; readonly start: string }
  | { readonly status: "completed"; readonly start: string; readonly end: string };

/**
 * Broad grouping used by the projects section filter (PORT-011): Pro
 * (employment — jobs and internships), Recherche, École (coursework, incl.
 * classes préparatoires) and Perso (personal projects with no institution
 * behind them).
 */
export type ProjectCategory = "pro" | "recherche" | "ecole" | "perso";

export interface Project {
  /** Entity or project name, shown on the card and as the page heading. */
  readonly title: LocalizedText;
  /** Route without a leading slash, e.g. `internships/safran`. */
  readonly href: string;
  /** One-line subtitle shown under the title. */
  readonly description: LocalizedText;
  readonly category: ProjectCategory;
  /** Logo of the company or school, or `null` for personal projects. */
  readonly entityLogo: string | null;
  /** Public repository URL, or `null` when there is none. */
  readonly githubRepo: string | null;
  readonly techLogos: readonly TechLogoId[];
  /** Card background image, or `null` when no visual is available. */
  readonly img: string | null;
  /** Carousel images; empty when there are none. */
  readonly photos: readonly string[];
  /** Omitted where the dates are not confirmed. */
  readonly period?: ProjectPeriod;
  /** Omitted where the location is not confirmed. Not translated: place
   * names are kept as-is in both languages (see PORT-017's ticket). */
  readonly location?: string;
  /** Set only on the one project shown as the double-width highlighted card. */
  readonly featured?: true;
  /**
   * Short role/title shown in the project page's "En bref" summary card.
   * Omitted where not yet authored (see PORT-012's ticket refinement).
   */
  readonly role?: LocalizedText;
  /** Team size or composition shown in "En bref". Omitted where not known. */
  readonly team?: string;
  /** Headline outcome shown in "En bref". Omitted where not yet authored. */
  readonly result?: LocalizedText;
}

/** `Project`, with every `LocalizedText` field resolved to a plain string for
 * one language — the shape every display component actually consumes. */
export type LocalizedProject = Omit<
  Project,
  "title" | "description" | "role" | "result"
> & {
  readonly title: string;
  readonly description: string;
  readonly role?: string;
  readonly result?: string;
};

/** Resolves every bilingual field of `project` to the given `language`. */
export function localizeProject(
  project: Project,
  language: Language
): LocalizedProject {
  return {
    ...project,
    title: project.title[language],
    description: project.description[language],
    role: project.role ? project.role[language] : undefined,
    result: project.result ? project.result[language] : undefined,
  };
}

export const projects = [
  {
    title: { fr: "GCII / Enedis", en: "GCII / Enedis" },
    href: "work/gcii",
    description: {
      fr: "Ingénieur logiciel fullstack",
      en: "Fullstack Software Engineer",
    },
    category: "pro",
    featured: true,
    entityLogo: null,
    githubRepo: null,
    techLogos: ["python", "react"],
    img: "/img/gcii-grid",
    photos: [],
    period: { status: "ongoing", start: "2025-11" },
    location: "Le Havre",
    role: {
      fr: "Ingénieur logiciel fullstack — refonte d'une application métier",
      en: "Fullstack Software Engineer — rebuilding a business application",
    },
    result: {
      fr: "Refonte en cours d'une application métier utilisée par plus de 10 000 utilisateurs chez Enedis, avec migration du socle historique PHP vers Django et React.",
      en: "Ongoing rebuild of a business application used by more than 10,000 users at Enedis, migrating the legacy PHP stack to Django and React.",
    },
  },
  {
    title: { fr: "Safran", en: "Safran" },
    href: "internships/safran",
    description: { fr: "Stage de fin d'études", en: "Final-year internship" },
    category: "pro",
    entityLogo: "/logos/safran",
    githubRepo: null,
    techLogos: ["typescript", "react", "git", "linux"],
    img: "/img/safran",
    photos: [],
    period: { status: "completed", start: "2025-04", end: "2025-09" },
    role: {
      fr: "Développeur logiciel — frameworks & outils internes",
      en: "Software Developer — internal frameworks & tooling",
    },
    result: {
      fr: "Framework et CLI adoptés pour la génération de nouveaux projets par plusieurs équipes internes.",
      en: "Framework and CLI adopted by several internal teams for generating new projects.",
    },
  },
  {
    title: { fr: "SNCF", en: "SNCF" },
    href: "research/sncf",
    description: { fr: "Projet de recherche", en: "Research project" },
    category: "recherche",
    entityLogo: "/logos/sncf",
    githubRepo: "https://github.com/corentinbunaux/projet-recherche-SNCF",
    techLogos: ["java", "git"],
    img: "/img/sncf",
    photos: [],
  },
  {
    title: { fr: "CCTV", en: "CCTV" },
    href: "personnal/cctv",
    description: {
      fr: "Projet de vidéo surveillance",
      en: "Video surveillance project",
    },
    category: "perso",
    entityLogo: null,
    githubRepo: null,
    techLogos: ["arduino", "python", "react"],
    img: "/img/cctv",
    photos: [],
  },
  {
    title: { fr: "Android", en: "Android" },
    href: "emse/android",
    description: {
      fr: "Développement d'une application mobile",
      en: "Mobile application development",
    },
    category: "ecole",
    img: "/img/android",
    entityLogo: "/logos/emse",
    githubRepo: null,
    techLogos: ["kotlin", "typescript", "git"],
    photos: [],
  },
  {
    title: { fr: "Démineur", en: "Minesweeper" },
    href: "emse/minesweeper",
    description: {
      fr: "Développement d'un jeu de démineur",
      en: "Building a minesweeper game",
    },
    category: "ecole",
    img: "/img/minesweeper",
    entityLogo: "/logos/emse",
    githubRepo: "https://github.com/corentinbunaux/minesweeper",
    techLogos: ["java"],
    photos: [],
  },
  {
    title: { fr: "Quimesis", en: "Quimesis" },
    href: "internships/quimesis",
    description: {
      fr: "Stage d'ingénierie logicielle",
      en: "Software engineering internship",
    },
    category: "pro",
    img: "/img/quimesis",
    entityLogo: "/logos/quimesis",
    githubRepo: null,
    techLogos: ["cpp", "react", "git", "linux"],
    photos: ["/img/quimesis-1", "/img/quimesis-2", "/img/quimesis-3"],
    period: { status: "completed", start: "2024-04", end: "2024-07" },
    location: "Belgique",
  },
  {
    title: { fr: "Kusmi Tea", en: "Kusmi Tea" },
    href: "internships/kusmitea",
    description: { fr: "Stage ouvrier", en: "Manual labor internship" },
    category: "pro",
    img: "/img/kusmitea",
    entityLogo: "/logos/kusmi-tea",
    githubRepo: null,
    photos: ["/img/kusmi-1"],
    techLogos: [],
    period: { status: "completed", start: "2023-01", end: "2023-01" },
    location: "Normandie",
  },
  {
    title: { fr: "Dévelopement Web", en: "Web Development" },
    href: "personnal/web",
    description: { fr: "Site web portfolio", en: "Portfolio website" },
    category: "perso",
    img: "/img/web",
    entityLogo: null,
    githubRepo: null,
    techLogos: ["html", "css", "javascript", "react"],
    photos: [],
  },
  {
    title: { fr: "Programmation", en: "Programming" },
    href: "emse/programming",
    description: {
      fr: "Algorithmie et structure de données",
      en: "Algorithms and data structures",
    },
    category: "ecole",
    img: "/img/programming",
    entityLogo: "/logos/emse",
    githubRepo: "https://github.com/dylan-bernhardt/dactylo-race",
    techLogos: ["python", "cpp", "git"],
    photos: [],
  },
  {
    title: { fr: "Systèmes Embarqués", en: "Embedded Systems" },
    href: "emse/embedded",
    description: { fr: "Projet Robot", en: "Robot project" },
    category: "ecole",
    img: "/img/embedded",
    entityLogo: "/logos/emse",
    githubRepo: null,
    techLogos: [],
    photos: ["/img/embedded-1", "/img/embedded-2"],
  },
  {
    title: { fr: "Robotique", en: "Robotics" },
    href: "cpge_tipe",
    description: {
      fr: "Élaboration d'un bras d'exosquelette",
      en: "Designing an exoskeleton arm",
    },
    category: "ecole",
    img: "/img/tipe",
    entityLogo: "/logos/ac-normandie",
    githubRepo: null,
    techLogos: ["arduino"],
    photos: ["/img/tipe-1", "/img/tipe-2"],
  },
] satisfies readonly Project[];
