"use client";

import "../app/app.css";
import { useEffect, useState } from "react";
import { projects } from "./projectsSection";
import React from "react";

export default function Project() {
  const [projectSlug, setProjectSlug] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.slice(1);
      setProjectSlug(path);
    }
  }, []);

  const projectData = projects.find((project) => project.href === projectSlug);
  return (
    <div>
      <h1>{projectData?.title}</h1>
      <p>{projectData?.description}</p>
      <div>
        <p>{projectData?.pageContent?.context}</p>
      </div>
    </div>
  );
}