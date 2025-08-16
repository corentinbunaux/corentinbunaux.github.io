"use client";

import Image from "next/image";
import "../app/app.css";
import { useEffect, useState } from "react";
import Robotics1 from "../img/Robotics1.png";
import Robotics2 from "../img/Robotics2.png";

import Quimesis1 from "../img/Quimesis1.png";
import Quimesis2 from "../img/Quimesis2.png";
import Quimesis3 from "../img/Quimesis3.png";
import Kusmi1 from "../img/Kusmi1.jpg";
import Kusmi2 from "../img/Kusmi2.jpg";
import Embedded1 from "../img/Embedded1.jpg";
import Embedded2 from "../img/Embedded2.png";
import Web1 from "../img/Web1.png";
import Web2 from "../img/Web2.jpg";
import Programing1 from "../img/Programing1.jpg";
import Programing2 from "../img/Programing2.jpg";
import Programing3 from "../img/Programing3.jpg";
import Programing4 from "../img/Programing4.png";

import { projects } from "./projectsSection";

function Project(props) {
  const [isClient, setIsClient] = useState(false);
  const [projectSlug, setProjectSlug] = useState("");

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      setProjectSlug(path.split("/")[1]);
    }
  }, []);

  const projectData = projects.find((project) => project.href === projectSlug);
  return (
    <div>
      <h1>{projectData?.title}</h1>
      <p>{projectData?.description}</p>
      <div>
        <p>{projectData?.pageContent?.context}</p>
        <p>{projectData?.pageContent?.mainPart.forEach((item) => item)}</p>
      </div>
    </div>
  );
}

export default Project;