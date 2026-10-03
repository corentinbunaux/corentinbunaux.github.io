"use client";

import { useEffect } from "react";
import Homepage from "./homepage";
import { SiteHeader } from "./SiteHeader";
import JourneySection from "./journeySection";
import AboutMe from "./aboutmeSection";
import ProjectsSection from "./projectsSection";
import Footer from "./footer";
import { replaceLocation } from "../lib/navigation";

export type ProjectExcerpts = Readonly<Record<string, { fr: string; en: string }>>;

/** Set once the reload has been handled for this document: the navigation
 * type stays "reload" for the document's whole life, and HomeShell remounts
 * on every client-side return to the home page. Module scope survives that. */
let reloadHandled = false;

export function HomeShell({ excerpts }: { excerpts: ProjectExcerpts }) {
  // A reload of the home page starts over from the top of "/", without the
  // section hash (Corentin's original behaviour: `location.href = "/"`).
  // In between it had become `redirect("/")` from next/navigation, which
  // (found by the PORT-069 E2E suite) (1) looped forever — the soft
  // navigation remounted HomeShell, whose effect redirected again, ~40 RSC
  // fetches/s — and (2) as a router transition, could land *after* the
  // visitor's first click and send them back home from a project page.
  // A plain document navigation has neither problem: the new document's
  // navigation type is "navigate", so it cannot loop, and it happens at
  // hydration, before any click. (Rewriting the URL + `scrollTo(0)` instead
  // was tried and lost a race with the browser's own reload scroll
  // restoration, leaving the page 45-60px down.)
  useEffect(() => {
    if (reloadHandled) return;
    reloadHandled = true;
    const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    // Only a reload *of the home page itself*: after reloading a project
    // page, a client-side visit to "/#portfolio" must keep its hash.
    if (entry?.type !== "reload" || new URL(entry.name).pathname !== "/") return;
    replaceLocation("/");
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
