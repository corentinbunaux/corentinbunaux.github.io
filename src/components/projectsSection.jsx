"use client";

import "../app/app.css";
import Link from "next/link";
import { useMemo, useState } from "react";
import { projects, localizeProject } from "../data/projects";
import { OptimizedImage } from "./optimizedImage";
import { bannerElmts } from "./Banner";
import { useTranslation } from "../i18n/dictionary";
import { useLanguage } from "../i18n/LanguageContext";

/** Filter pills shown above the grid. "all" is not a real project category. */
function useCategoryFilters() {
  const t = useTranslation();
  return [
    { id: "all", label: t.projects.filters.all },
    { id: "pro", label: t.projects.filters.pro },
    { id: "recherche", label: t.projects.filters.recherche },
    { id: "ecole", label: t.projects.filters.ecole },
    { id: "perso", label: t.projects.filters.perso },
  ];
}

/** Small round pill rendering one tech logo, reusing the icons from Banner.jsx. */
const TechPill = ({ id }) => {
  const logo = bannerElmts.find((elmt) => elmt.id === id);
  if (!logo) return null;

  return (
    <span
      className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-raised"
      title={id}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={logo.viewBox}
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        {logo.svgContent}
      </svg>
    </span>
  );
};

const ProjectCard = ({ project, t, excerpt }) => (
  <Link
    href={`/${project.href}`}
    className={`group flex flex-col overflow-hidden rounded-lg border border-second bg-surface transition-colors hover:border-secondary ${
      project.featured ? "sm:col-span-2" : ""
    }`}
  >
    <div className="relative aspect-video w-full overflow-hidden bg-surface-raised">
      {project.img ? (
        <OptimizedImage
          src={project.img}
          alt=""
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm text-second-text">
          {t.projects.previewComing}
        </span>
      )}
    </div>
    <div className="flex flex-1 flex-col gap-2 p-4">
      <h3 className="text-lg font-semibold text-main-text">{project.title}</h3>
      <p className="text-sm text-second-text">{project.description}</p>
      {excerpt && (
        <p className="line-clamp-5 flex-1 text-sm text-second-text/90">{excerpt}</p>
      )}
      {project.techLogos.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {project.techLogos.map((id) => (
            <TechPill key={id} id={id} />
          ))}
        </div>
      )}
    </div>
  </Link>
);

function ProjectsSection({ excerpts }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const t = useTranslation();
  const { language } = useLanguage();
  const categoryFilters = useCategoryFilters();

  const filteredProjects = useMemo(() => {
    const matching =
      activeFilter === "all"
        ? projects
        : projects.filter((project) => project.category === activeFilter);

    // The featured project, when present in the filtered set, always leads.
    const sorted = [...matching].sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    );
    return sorted.map((project) => localizeProject(project, language));
  }, [activeFilter, language]);

  return (
    <section
      id="section-portfolio"
      className="flex justify-center items-center h-full"
    >
      <div className="container p-5">
        <h1 className="outlined-text">{t.common.projects}</h1>
        <div
          className="mb-6 flex flex-wrap gap-2"
          role="group"
          aria-label={t.projects.filterGroupLabel}
        >
          {categoryFilters.map((filter) => {
            const isActive = filter.id === activeFilter;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                aria-pressed={isActive}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "border-secondary bg-secondary text-main-text"
                    : "border-second bg-surface text-second-text hover:border-secondary"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.href}
              project={project}
              t={t}
              excerpt={excerpts[project.href]?.[language]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectsSection;
