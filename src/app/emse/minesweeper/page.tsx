import { projects } from "../../../data/projects";
import { ProjectPage } from "../../../components/ProjectPage";

const project = projects.find((p) => p.href === "emse/minesweeper");

if (!project) {
  throw new Error(
    'Project "emse/minesweeper" not found in src/data/projects.ts.'
  );
}

export default function Page() {
  return <ProjectPage project={project} />;
}
