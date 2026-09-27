import { useLanguage } from "./LanguageContext";
import { type AboutDict, aboutEn, aboutFr } from "./namespaces/about";
import { type CommonDict, commonEn, commonFr } from "./namespaces/common";
import { type DemosDict, demosEn, demosFr } from "./namespaces/demos";
import { type FooterDict, footerEn, footerFr } from "./namespaces/footer";
import { type GuardsDict, guardsEn, guardsFr } from "./namespaces/guards";
import { type HeaderDict, headerEn, headerFr } from "./namespaces/header";
import { type HeroDict, heroEn, heroFr } from "./namespaces/hero";
import { type JourneyDict, journeyEn, journeyFr } from "./namespaces/journey";
import {
  type MinesweeperDict,
  minesweeperEn,
  minesweeperFr,
} from "./namespaces/minesweeper";
import { type NavbarDict, navbarEn, navbarFr } from "./namespaces/navbar";
import { type PredictDict, predictEn, predictFr } from "./namespaces/predict";
import { type ProfileDict, profileEn, profileFr } from "./namespaces/profile";
import {
  type ProjectPageDict,
  projectPageEn,
  projectPageFr,
} from "./namespaces/projectPage";
import { type ProjectsDict, projectsEn, projectsFr } from "./namespaces/projects";
import { type TypingDict, typingEn, typingFr } from "./namespaces/typing";

/**
 * The UI dictionary, nested by the component that consumes each group of
 * keys. Every leaf is a plain, already-resolved string — unlike
 * `src/data/projects.ts`'s bilingual fields, which store `{ fr, en }` pairs
 * because that data crosses the app/route boundary before a language is
 * known. Here the `Dictionary` interface is shared by both `fr` and `en`
 * objects below, so a missing translation is a compile error, not a runtime
 * fallback.
 */
export interface Dictionary {
  common: CommonDict;
  navbar: NavbarDict;
  header: HeaderDict;
  hero: HeroDict;
  profile: ProfileDict;
  journey: JourneyDict;
  projects: ProjectsDict;
  projectPage: ProjectPageDict;
  about: AboutDict;
  footer: FooterDict;
  demos: DemosDict;
  minesweeper: MinesweeperDict;
  guards: GuardsDict;
  typing: TypingDict;
  predict: PredictDict;
}

const fr: Dictionary = {
  common: commonFr,
  navbar: navbarFr,
  header: headerFr,
  hero: heroFr,
  profile: profileFr,
  journey: journeyFr,
  projects: projectsFr,
  projectPage: projectPageFr,
  about: aboutFr,
  footer: footerFr,
  demos: demosFr,
  minesweeper: minesweeperFr,
  guards: guardsFr,
  typing: typingFr,
  predict: predictFr,
};

const en: Dictionary = {
  common: commonEn,
  navbar: navbarEn,
  header: headerEn,
  hero: heroEn,
  profile: profileEn,
  journey: journeyEn,
  projects: projectsEn,
  projectPage: projectPageEn,
  about: aboutEn,
  footer: footerEn,
  demos: demosEn,
  minesweeper: minesweeperEn,
  guards: guardsEn,
  typing: typingEn,
  predict: predictEn,
};

export const dictionary = { fr, en };

/** Returns the dictionary for the currently active language. Must be called
 * from within a `LanguageProvider` (see `src/i18n/LanguageContext.tsx`). */
export function useTranslation(): Dictionary {
  const { language } = useLanguage();
  return dictionary[language];
}
