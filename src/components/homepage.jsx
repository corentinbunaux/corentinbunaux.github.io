import React from "react";
import "../app/app.css";
import { useTranslation } from "../i18n/dictionary";
import { useLanguage } from "../i18n/LanguageContext";
import { projects } from "../data/projects";
import { TechBadge } from "./TechBadge";
import { HeroVisual } from "./hero/HeroVisual";

const EMAIL = "corentin.bunaux@gmail.com";
const LINKEDIN_URL = "http://linkedin.com/in/corentin-bunaux";
const GITHUB_URL = "https://github.com/corentinbunaux";

/** Everyday stack shown under the CTAs. Labels as in ProjectPage's TECH_LABELS. */
const HERO_STACK = [
  { id: "typescript", label: "TypeScript" },
  { id: "react", label: "React" },
  { id: "python", label: "Python" },
  { id: "git", label: "Git" },
  { id: "linux", label: "Linux" },
  { id: "copilot", label: "Copilot CLI" },
];

export function GithubLogo(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0053,10.0053,0,0,0,12,2.2467Z"
      ></path>
    </svg>
  );
}

function LinkedInLogo(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M20.47,2H3.53A1.45,1.45,0,0,0,2.06,3.43V20.57A1.45,1.45,0,0,0,3.53,22H20.47a1.45,1.45,0,0,0,1.47-1.43V3.43A1.45,1.45,0,0,0,20.47,2ZM8.09,18.74h-3v-9h3ZM6.59,8.48h0a1.56,1.56,0,1,1,0-3.12,1.57,1.57,0,1,1,0,3.12ZM18.91,18.74h-3V13.91c0-1.21-.43-2-1.52-2A1.65,1.65,0,0,0,12.85,13a2,2,0,0,0-.1.73v5h-3s0-8.18,0-9h3V11A3,3,0,0,1,15.46,9.5c2,0,3.45,1.29,3.45,4.06Z"
      ></path>
    </svg>
  );
}

function Homepage() {
  const t = useTranslation();
  const { language } = useLanguage();
  const companies = projects
    .filter((p) => p.category === "pro" || p.category === "recherche")
    .map((p) => p.title[language])
    .join(" · ");

  return (
    <div className="mx-auto grid min-h-[100svh] max-w-6xl items-center gap-10 px-4 pb-16 pt-[calc(var(--header-height)+2rem)] sm:px-8 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <p className="text-second-text">
          {t.hero.greeting} {t.hero.namePrefix}
        </p>
        <h1 className="mt-1 text-4xl font-bold text-main-text sm:text-5xl">Corentin Bunaux</h1>
        <p className="mt-3 text-lg text-my-blue">{t.hero.tagline}</p>
        <p className="mt-4 text-main-text">
          {t.profile.roleIntro}
          <strong className="text-my-green">GCII</strong>
          {t.profile.roleClient}
          <strong className="text-my-green">Enedis</strong>
          {t.profile.roleLocation}
          <strong className="text-my-green">Le Havre</strong>.
        </p>
        <p className="mt-2 text-second-text">
          {t.profile.experienceSummary} {t.profile.personality}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href="#portfolio" className="rounded-full bg-my-green px-6 py-2 font-medium text-main hover:underline">
            {t.hero.cta}
          </a>
          <a href={`mailto:${EMAIL}`} className="rounded-full border border-second px-6 py-2 text-main-text hover:bg-surface-raised">
            {t.footer.contactCta}
          </a>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label={t.hero.linkedinLabel} className="p-2 text-main-text hover:text-my-green">
            <LinkedInLogo className="h-6 w-6" />
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label={t.hero.githubLabel} className="p-2 text-main-text hover:text-my-green">
            <GithubLogo className="h-6 w-6" />
          </a>
        </div>

        <p className="mt-8 text-sm text-second-text">{t.hero.stackLabel}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {HERO_STACK.map(({ id, label }) => (
            <TechBadge key={id} id={id} label={label} />
          ))}
        </ul>

        <p className="mt-6 text-sm text-second-text">{t.hero.languages}</p>
        <p className="mt-1 text-sm text-second-text">
          {t.hero.experienceLabel} {companies}
        </p>
      </div>

      <HeroVisual />
    </div>
  );
}

export default Homepage;
