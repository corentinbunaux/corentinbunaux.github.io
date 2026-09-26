import Link from "next/link";
import "../app/app.css";
import {
  projects,
  localizeProject,
  type Project,
  type ProjectPeriod,
} from "../data/projects";
import { useTranslation } from "../i18n/dictionary";
import { useLanguage } from "../i18n/LanguageContext";
import type { Dictionary } from "../i18n/dictionary";

/**
 * A project that has a confirmed `period`. `projects` models "dates not
 * confirmed yet" by omitting the field (see `Project.period` in
 * `src/data/projects.ts`), so this timeline only ever shows entries the data
 * layer has actually dated — nothing here is guessed.
 */
type JourneyProject = Project & { readonly period: ProjectPeriod };

function hasPeriod(project: Project): project is JourneyProject {
  return project.period !== undefined;
}

// Oldest first: chronological order reads as "how I got here", ending on the
// current position. Sorting on the `YYYY-MM` string works because lexical
// order matches chronological order for that format.
// `projects` is typed via `satisfies readonly Project[]`, which keeps each
// element's literal type instead of widening to `Project`. That defeats
// `Array.prototype.filter`'s type-predicate overload (it requires the
// narrowed type to be a subtype of the array's own element type, and
// `JourneyProject` is not a subtype of a narrower literal element type) —
// so the intermediate cast below widens to `Project` first, purely to let
// `hasPeriod` narrow correctly.
const allProjects: readonly Project[] = projects;

const journeyEntries: readonly JourneyProject[] = allProjects
  .filter(hasPeriod)
  .slice()
  .sort((a, b) => a.period.start.localeCompare(b.period.start));

function formatMonthYear(yearMonth: string, months: readonly string[]): string {
  const [year, month] = yearMonth.split("-").map(Number);
  return `${months[month - 1]} ${year}`;
}

function formatPeriod(period: ProjectPeriod, t: Dictionary): string {
  const months = t.common.months;
  if (period.status === "ongoing") {
    return `${formatMonthYear(period.start, months)} → ${t.journey.ongoingLabel}`;
  }

  const [startYear, startMonth] = period.start.split("-").map(Number);
  const [endYear, endMonth] = period.end.split("-").map(Number);

  if (startYear === endYear && startMonth === endMonth) {
    return formatMonthYear(period.start, months);
  }
  if (startYear === endYear) {
    return `${months[startMonth - 1]} – ${months[endMonth - 1]} ${endYear}`;
  }
  return `${formatMonthYear(period.start, months)} – ${formatMonthYear(period.end, months)}`;
}

function JourneyEntryRow({
  entry,
  isLast,
  t,
  language,
}: {
  entry: JourneyProject;
  isLast: boolean;
  t: Dictionary;
  language: "fr" | "en";
}) {
  const isOngoing = entry.period.status === "ongoing";
  const localized = localizeProject(entry, language);
  const subtitle = entry.location
    ? `${localized.description} · ${entry.location}`
    : localized.description;

  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <span
          className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${
            isOngoing ? "bg-my-green" : "bg-second-text"
          }`}
          aria-hidden="true"
        />
        {!isLast && (
          <span className="w-px flex-1 bg-second" aria-hidden="true" />
        )}
      </div>
      <Link
        href={`/${entry.href}`}
        className="block flex-1 rounded-md pb-6 focus-visible:outline-none"
      >
        <h2 className="text-lg font-semibold text-main-text hover:underline">
          {localized.title}
          {isOngoing && (
            <span className="ml-2 rounded-full bg-my-green/20 px-2 py-0.5 text-xs font-normal text-my-green">
              {t.journey.currentBadge}
            </span>
          )}
        </h2>
        <p className="text-second-text">{subtitle}</p>
        <p className="text-sm text-second-text">{formatPeriod(entry.period, t)}</p>
      </Link>
    </li>
  );
}

function JourneySection() {
  const t = useTranslation();
  const { language } = useLanguage();
  return (
    <div className="container mx-auto px-[var(--section-padding-x)] py-[var(--section-padding-y)]">
      <h1 className="outlined-text">{t.journey.title}</h1>
      <div className="mt-8 rounded-lg border border-second bg-surface-raised p-6 md:p-8">
        <ol className="flex flex-col">
          {journeyEntries.map((entry, index) => (
            <JourneyEntryRow
              key={entry.href}
              entry={entry}
              isLast={index === journeyEntries.length - 1}
              t={t}
              language={language}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}

export default JourneySection;
