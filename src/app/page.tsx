"use client";

import { useState, useEffect } from "react";
import Homepage from "../components/homepage";
import { SiteHeader } from "../components/SiteHeader";
import ProfileSection from "../components/profileSection";
import JourneySection from "../components/journeySection";
import "./app.css";
import AboutMe from "../components/aboutmeSection";
import ProjectsSection from "../components/projectsSection";
import Footer from "../components/footer";
import React from "react";

export default function Home() {
  const [allTops, setAllTops] = useState({
    homepageTop: 0,
    profileTop: 0,
    journeyTop: 0,
    portfolioTop: 0,
    aboutTop: 0,
  });

  useEffect(() => {
    const updateTops = () => {
      setAllTops({
        homepageTop: document.getElementById("home").offsetTop,
        profileTop: document.getElementById("profile").offsetTop,
        journeyTop: document.getElementById("journey").offsetTop,
        portfolioTop: document.getElementById("portfolio").offsetTop,
        aboutTop: document.getElementById("about").offsetTop,
      });
    };

    updateTops();

    window.addEventListener("resize", updateTops);

    return () => {
      window.removeEventListener("resize", updateTops);
    };
  }, []);

  useEffect(() => {
    if (performance.navigation.type === 1) {
      window.location.href = "/";
    }
  }, []);

  return (
    <>
      <SiteHeader variant="home" />
      <section id="home" className="relative">
        <Homepage portfolioTop={allTops.portfolioTop} />
      </section>
      <section id="profile">
        <ProfileSection portfolioTop={allTops.portfolioTop} />
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
