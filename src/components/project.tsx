"use client";

import "../app/app.css";
import { useEffect, useState } from "react";
import { projects } from "./projectsSection";
import React from "react";
import Image from "next/image";
import { GithubLogo } from "./homepage";
import { bannerElmts } from "./Banner";

export default function Project() {
  const [projectSlug, setProjectSlug] = useState("");
  // windowWidth removed since it is unused

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.slice(1);
      setProjectSlug(path);
      // setWindowWidth(window.innerWidth); // removed since unused
    }
  }, []);

  const projectData = projects.find((project) => project.href === projectSlug);
  const githubRepo = projectData?.githubRepo;
  const entityLogo = projectData?.entityLogo;
  const techLogos =
    projectData?.techLogos
      .map((id) => bannerElmts.find((elmt) => elmt.id === id))
      .filter(Boolean) || [];

  return (
    <div className="project-page-container p-8 max-w-6xl mx-auto">
      <hr
        style={{
          border: "none",
          borderTop: "2px solid var(--my-green)",
          margin: "2rem 0",
          opacity: 0.7,
        }}
      />
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-center w-full">
        <div className="flex justify-between items-center gap-6 w-full">
          <div>
            <h1 className="text-4xl font-bold mb-2">{projectData?.title}</h1>
            <p className="text-lg mb-2">{projectData?.description}</p>
            {githubRepo && (
              <div className="mb-4">
                <a
                  href={githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-link flex items-center gap-2 mt-3"
                >
                  <GithubLogo className="w-8 h-8 ms-1" />
                  <span
                    className="text-[1rem]"
                    style={{ color: "var(--my-green)" }}
                  >
                    Lien vers le dépôt GitHub
                  </span>
                </a>
              </div>
            )}
            {techLogos.length > 0 && (
              <div className="flex items-start gap-2 max-w-xs max-h-10 mb-6">
                {techLogos.map((logo, index) => (
                  <div key={index}>
                    {logo.svgContent ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox={logo.viewBox}
                        id={logo.id}
                        className="h-10 w-10"
                      >
                        {logo.svgContent}
                      </svg>
                    ) : (
                      <Image
                        src={logo.src}
                        alt="Tech Logo"
                        width={32}
                        height={32}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
            
          {entityLogo && (
            <div
              className="rounded-lg p-3 bg-white flex items-center justify-center"
              style={{
                maxWidth: "10rem",
                maxHeight: "10rem",
                minWidth: "5rem",
                minHeight: "5rem",
              }}
            >
              <Image
                src={entityLogo}
                alt="Entity Logo"
                width={2000}
                height={2000}
                style={{ objectFit: "contain" }}
              />
            </div>
          )}
        </div>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "2px solid var(--my-green)",
          margin: "2rem 0",
          opacity: 0.7,
        }}
      />

      {/* Context Section */}
      {projectData?.pageContent?.context && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Contexte</h2>
          <p>{projectData.pageContent.context}</p>
        </div>
      )}

      <div className="flex justify-center mb-16">
        <span className="text-3xl font-bold tracking-widest">...</span>
      </div>

      {/* Main Parts Section */}
      {projectData?.pageContent?.mainPart &&
        projectData.pageContent.mainPart.length > 0 && (
          <div>
            {projectData.pageContent.mainPart.map((part: any, idx: number) => (
              <div key={idx} className="mb-6">
                <h3 className="text-xl mb-1">{part.title}</h3>
                <p>{part.description}</p>

                {(idx < projectData.pageContent.mainPart.length - 1) && (
                  <hr
                    style={{
                      border: "none",
                      borderTop: "2px solid var(--my-blue)",
                      margin: "2rem 0",
                      opacity: 0.4,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
