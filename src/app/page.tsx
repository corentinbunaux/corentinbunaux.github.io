"use client";

import { useEffect } from "react";
import Homepage from "../components/homepage";
import { SiteHeader } from "../components/SiteHeader";
import JourneySection from "../components/journeySection";
import "./app.css";
import AboutMe from "../components/aboutmeSection";
import ProjectsSection from "../components/projectsSection";
import Footer from "../components/footer";
import React from "react";

export default function Home() {
  useEffect(() => {
    if (performance.navigation.type === 1) {
      window.location.href = "/";
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
        <ProjectsSection />
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
