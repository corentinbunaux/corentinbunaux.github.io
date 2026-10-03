"use client";

import { Fragment } from "react";
import Link from "next/link";
import { TechBadge } from "./TechBadge";
import { OptimizedImage } from "./optimizedImage";
import { DemoSection, InlineVisual } from "./demos/DemoSection";
import { SiteHeader } from "./SiteHeader";
import {
  projects,
  localizeProject,
  type Project,
  type ProjectPeriod,
  type TechLogoId,
} from "../data/projects";
import type { Article } from "../lib/articleTypes";
import { useTranslation, type Dictionary } from "../i18n/dictionary";
import { useLanguage } from "../i18n/LanguageContext";

const TECH_LABELS: Record<TechLogoId, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  react: "React",
  typescript: "TypeScript",
  kotlin: "Kotlin",
  sql: "SQL",
  python: "Python",
  java: "Java",
  cpp: "C++",
  arduino: "Arduino",
  windows: "Windows",
  linux: "Linux",
  office: "Office",
  git: "Git",
  copilot: "Copilot CLI",
};

/**
 * Guard against linking prev/next to a project that has a `src/data/projects.ts`
 * entry but no `page.tsx` route yet (e.g. a project added ahead of its page
 * being written). Empty now that all 12 entries have routes (PORT-013 added
 * the last one, `work/gcii`) — kept so a future data-only entry doesn't
 * produce a dead link.
 */
const UNROUTED_HREFS = new Set<string>([]);

function formatDuration(period: ProjectPeriod | undefined, t: Dictionary): string | null {
  if (!period) return null;

  const [startYear, startMonth] = period.start.split("-").map(Number);

  if (period.status === "ongoing") {
    return `${t.projectPage.since} ${t.common.months[startMonth - 1]} ${startYear}`;
  }

  const [endYear, endMonth] = period.end.split("-").map(Number);
  const monthCount = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  const unit =
    monthCount === 1 ? t.projectPage.monthSingular : t.projectPage.monthPlural;
  return `${monthCount} ${unit}`;
}

function findNeighbor(startIndex: number, step: 1 | -1): Project | undefined {
  for (
    let i = startIndex + step;
    i >= 0 && i < projects.length;
    i += step
  ) {
    if (!UNROUTED_HREFS.has(projects[i].href)) {
      return projects[i];
    }
  }
  return undefined;
}

export type ProjectPageProps = {
  /**
   * The project this page presents, resolved at build time by the route's
   * `page.tsx` (a static import from `src/data/projects.ts`) — never from
   * `window.location`. See PORT-012's ticket refinement for the routing
   * decision this encodes.
   */
  project: Project;
  /** Read from content/projects at build time by the route (PORT-036). */
  article: Article;
};

export function ProjectPage({ project: rawProject, article }: ProjectPageProps) {
  const t = useTranslation();
  const { language } = useLanguage();
  const project = localizeProject(rawProject, language);
  const sections = article[language];
  const index = projects.findIndex((p) => p.href === rawProject.href);
  const previousRaw = index === -1 ? undefined : findNeighbor(index, -1);
  const nextRaw = index === -1 ? undefined : findNeighbor(index, 1);
  const previous = previousRaw ? localizeProject(previousRaw, language) : undefined;
  const next = nextRaw ? localizeProject(nextRaw, language) : undefined;
  const duration = formatDuration(project.period, t);
  const stack = project.techLogos.map((id) => TECH_LABELS[id]);

  return (
    <>
      <SiteHeader variant="project" />
      <main className="project-page mx-auto max-w-6xl px-4 pb-8 pt-[calc(var(--header-height)+2rem)] sm:px-8">
      <nav
        aria-label={t.projectPage.breadcrumbLabel}
        className="mb-6 flex flex-wrap items-center gap-4 text-sm text-second-text"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-my-green">
              {t.projectPage.home}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/#portfolio" className="hover:text-my-green">
              {t.common.projects}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-main-text">
            {project.title}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem]">
        <header className="min-w-0 lg:col-start-1 lg:row-start-1">
          <h1 className="mb-2 text-3xl font-bold text-main-text sm:text-4xl">
            {project.title}
          </h1>
          <p className="mb-4 text-lg text-second-text">
            {project.description}
          </p>

          {project.img && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-second bg-surface">
              <OptimizedImage
                src={project.img}
                alt={`${t.projectPage.visualAltPrefix}${project.title}`}
                priority
                sizes="(min-width: 1024px) 60vw, 100vw"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          )}

          {project.techLogos.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {project.techLogos.map((id) => (
                <TechBadge key={id} id={id} label={TECH_LABELS[id]} />
              ))}
            </ul>
          )}
        </header>

        {/* Placed here in the DOM (not after the content column) so that
            below 1024px — where the grid collapses to one column — "En bref"
            appears right after the article header, before the sections, per
            PORT-035. On lg+ it is pulled into the right column and made to
            span both rows via explicit grid placement, so the visual order
            (header, then two columns) stays distinct from an `order-*` trick
            that would desync visual order from DOM/tab order. Trade-off:
            keyboard tab order visits "En bref" (its repo link) right after
            the header, before the article sections — acceptable since it
            mirrors the mobile reading order. */}
        <aside
          aria-labelledby="en-bref-heading"
          className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start"
        >
          <div className="rounded-2xl border border-second bg-surface-raised p-6">
            <h2
              id="en-bref-heading"
              className="mb-4 text-lg font-semibold text-main-text"
            >
              {t.projectPage.enBref}
            </h2>
            <dl className="space-y-4 text-sm">
              {project.role && (
                <div>
                  <dt className="text-second-text">{t.projectPage.role}</dt>
                  <dd className="text-main-text">{project.role}</dd>
                </div>
              )}
              {duration && (
                <div>
                  <dt className="text-second-text">{t.projectPage.duration}</dt>
                  <dd className="text-main-text">{duration}</dd>
                </div>
              )}
              {project.team && (
                <div>
                  <dt className="text-second-text">{t.projectPage.team}</dt>
                  <dd className="text-main-text">{project.team}</dd>
                </div>
              )}
              {stack.length > 0 && (
                <div>
                  <dt className="text-second-text">{t.projectPage.stack}</dt>
                  <dd className="text-main-text">{stack.join(", ")}</dd>
                </div>
              )}
              {project.result && (
                <div>
                  <dt className="text-second-text">{t.projectPage.result}</dt>
                  <dd className="text-main-text">{project.result}</dd>
                </div>
              )}
            </dl>

            {project.entityLogos.length > 0 && (
              <div className="mt-6 flex items-center justify-center gap-4 rounded-lg bg-white p-3">
                {project.entityLogos.map((logo) => (
                  <OptimizedImage
                    key={logo}
                    src={logo}
                    alt={`${t.projectPage.logoLabel} ${project.title}`}
                    sizes="8rem"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxWidth: project.entityLogos.length > 1 ? "6rem" : "8rem",
                    }}
                  />
                ))}
              </div>
            )}

            {project.githubRepo && (
              <a
                href={project.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-center text-sm font-medium text-my-green hover:underline"
              >
                {t.projectPage.viewRepo}
              </a>
            )}
          </div>
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <div className="space-y-10">
            {sections.map((section, idx) => {
              const headingId = `section-${idx}-heading`;
              return (
                <Fragment key={headingId}>
                  <section aria-labelledby={headingId}>
                    <p className="mb-1 text-sm font-semibold tracking-widest text-my-green">
                      {String(idx + 1).padStart(2, "0")}
                    </p>
                    <h2 id={headingId} className="mb-2 text-xl font-semibold text-main-text">
                      {section.title}
                    </h2>
                    <div className="space-y-4">
                      {section.paragraphs.map((paragraph, pIdx) => (
                        <p key={pIdx} className="text-main-text">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                  {idx === 0 && <InlineVisual href={project.href} />}
                </Fragment>
              );
            })}

            <DemoSection
              href={project.href}
              number={sections.length + 1}
            />

            {project.photos.length > 0 && (
              <section aria-labelledby="gallery-heading">
                <h2
                  id="gallery-heading"
                  className="mb-4 text-xl font-semibold text-main-text"
                >
                  {t.projectPage.gallery}
                </h2>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {project.photos.map((photo, idx) => (
                    <li
                      key={photo}
                      className="overflow-hidden rounded-xl border border-second bg-surface"
                    >
                      <OptimizedImage
                        src={photo}
                        alt={`${project.title} — ${t.projectPage.photoLabel} ${idx + 1}`}
                        sizes="(min-width: 640px) 50vw, 100vw"
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <nav
            aria-label={t.projectPage.navBetweenProjects}
            className="mt-12 flex flex-col gap-4 border-t border-second pt-6 sm:flex-row sm:justify-between"
          >
            {previous ? (
              <Link
                href={`/${previous.href}`}
                className="group flex flex-col text-left"
              >
                <span className="text-sm text-second-text">
                  ← {t.projectPage.prevProject}
                </span>
                <span className="font-semibold text-main-text group-hover:text-my-green">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/${next.href}`}
                className="group flex flex-col text-right sm:items-end"
              >
                <span className="text-sm text-second-text">
                  {t.projectPage.nextProject} →
                </span>
                <span className="font-semibold text-main-text group-hover:text-my-green">
                  {next.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>
      </div>
      </main>
    </>
  );
}
