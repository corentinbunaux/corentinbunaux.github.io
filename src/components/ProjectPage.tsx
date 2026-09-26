import Link from "next/link";
import { OptimizedImage } from "./optimizedImage";
import {
  projects,
  type Project,
  type ProjectPeriod,
  type TechLogoId,
} from "../data/projects";

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

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
};

/**
 * `work/gcii` (GCII / Enedis) has a data entry (PORT-008) but no route yet —
 * its `page.tsx` ships with PORT-013, which migrates the remaining project
 * pages onto this template. Until then, skip it in prev/next navigation so
 * the pilot page never links to a 404. Remove this once PORT-013 adds the
 * route.
 */
const UNROUTED_HREFS = new Set(["work/gcii"]);

function formatDuration(period?: ProjectPeriod): string | null {
  if (!period) return null;

  const [startYear, startMonth] = period.start.split("-").map(Number);

  if (period.status === "ongoing") {
    return `Depuis ${MONTHS[startMonth - 1]} ${startYear}`;
  }

  const [endYear, endMonth] = period.end.split("-").map(Number);
  const months = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  return months === 1 ? "1 mois" : `${months} mois`;
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
};

export function ProjectPage({ project }: ProjectPageProps) {
  const index = projects.findIndex((p) => p.href === project.href);
  const previous = index === -1 ? undefined : findNeighbor(index, -1);
  const next = index === -1 ? undefined : findNeighbor(index, 1);
  const duration = formatDuration(project.period);
  const stack = project.techLogos.map((id) => TECH_LABELS[id]);

  return (
    <main className="project-page mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-second-text">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-my-green">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/#section-portfolio" className="hover:text-my-green">
              Projets
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-main-text">
            {project.title}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <header className="mb-8">
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
                  alt={`Visuel du projet ${project.title}`}
                  priority
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            )}

            {stack.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {stack.map((label) => (
                  <li
                    key={label}
                    className="rounded-full border border-second bg-surface px-3 py-1 text-sm text-main-text"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            )}
          </header>

          <div className="space-y-10">
            <section aria-labelledby="section-context-heading">
              <p className="mb-1 text-sm font-semibold tracking-widest text-my-green">
                01
              </p>
              <h2
                id="section-context-heading"
                className="mb-2 text-xl font-semibold text-main-text"
              >
                Contexte
              </h2>
              <p className="text-main-text">{project.pageContent.context}</p>
            </section>

            {project.pageContent.mainPart.map((part, idx) => {
              const headingId = `section-${idx}-heading`;
              return (
                <section key={part.title} aria-labelledby={headingId}>
                  <p className="mb-1 text-sm font-semibold tracking-widest text-my-green">
                    {String(idx + 2).padStart(2, "0")}
                  </p>
                  <h2
                    id={headingId}
                    className="mb-2 text-xl font-semibold text-main-text"
                  >
                    {part.title}
                  </h2>
                  <p className="text-main-text">{part.description}</p>
                </section>
              );
            })}

            {project.photos.length > 0 && (
              <section aria-labelledby="gallery-heading">
                <h2
                  id="gallery-heading"
                  className="mb-4 text-xl font-semibold text-main-text"
                >
                  Galerie
                </h2>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {project.photos.map((photo, idx) => (
                    <li
                      key={photo}
                      className="overflow-hidden rounded-xl border border-second bg-surface"
                    >
                      <OptimizedImage
                        src={photo}
                        alt={`${project.title} — photo ${idx + 1}`}
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
            aria-label="Navigation entre projets"
            className="mt-12 flex flex-col gap-4 border-t border-second pt-6 sm:flex-row sm:justify-between"
          >
            {previous ? (
              <Link
                href={`/${previous.href}`}
                className="group flex flex-col text-left"
              >
                <span className="text-sm text-second-text">
                  ← Projet précédent
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
                  Projet suivant →
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

        <aside
          aria-labelledby="en-bref-heading"
          className="lg:sticky lg:top-8 lg:self-start"
        >
          <div className="rounded-2xl border border-second bg-surface-raised p-6">
            <h2
              id="en-bref-heading"
              className="mb-4 text-lg font-semibold text-main-text"
            >
              En bref
            </h2>
            <dl className="space-y-4 text-sm">
              {project.role && (
                <div>
                  <dt className="text-second-text">Rôle</dt>
                  <dd className="text-main-text">{project.role}</dd>
                </div>
              )}
              {duration && (
                <div>
                  <dt className="text-second-text">Durée</dt>
                  <dd className="text-main-text">{duration}</dd>
                </div>
              )}
              {project.team && (
                <div>
                  <dt className="text-second-text">Équipe</dt>
                  <dd className="text-main-text">{project.team}</dd>
                </div>
              )}
              {stack.length > 0 && (
                <div>
                  <dt className="text-second-text">Stack</dt>
                  <dd className="text-main-text">{stack.join(", ")}</dd>
                </div>
              )}
              {project.result && (
                <div>
                  <dt className="text-second-text">Résultat</dt>
                  <dd className="text-main-text">{project.result}</dd>
                </div>
              )}
            </dl>

            {project.entityLogo && (
              <div className="mt-6 flex items-center justify-center rounded-lg bg-white p-3">
                <OptimizedImage
                  src={project.entityLogo}
                  alt={`Logo ${project.title}`}
                  sizes="8rem"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxWidth: "8rem",
                  }}
                />
              </div>
            )}

            {project.githubRepo && (
              <a
                href={project.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-center text-sm font-medium text-my-green hover:underline"
              >
                Voir le dépôt GitHub
              </a>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
