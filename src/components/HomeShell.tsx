"use client";

import { useEffect } from "react";
import Homepage from "./homepage";
import { SiteHeader } from "./SiteHeader";
import JourneySection from "./journeySection";
import AboutMe from "./aboutmeSection";
import ProjectsSection from "./projectsSection";
import Footer from "./footer";
import { redirect } from "next/navigation";

export type ProjectExcerpts = Readonly<Record<string, { fr: string; en: string }>>;

export function HomeShell({ excerpts }: { excerpts: ProjectExcerpts }) {
  useEffect(() => {
    if (performance.navigation.type === 1) {
      redirect("/");
    }
  }, []);

  return (
    <>
      <SiteHeader variant="home" />
      <section id="home" className="relative">
        <Homepage />
      </section>
      <section id="journey" className="flex justify-center items-center">
        <JourneySection />
      </section>
      <section id="portfolio">
        <ProjectsSection excerpts={excerpts} />
      </section>
      <section id="about" className="flex justify-center items-center">
        <AboutMe />
      </section>
      <section id="footer">
        <Footer />
      </section>
    </>
  );
}
