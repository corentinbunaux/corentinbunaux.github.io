import { projects } from "../../../data/projects";
import { ProjectPage } from "../../../components/ProjectPage";

const project = projects.find((p) => p.href === "emse/programming");

if (!project) {
  throw new Error(
    'Project "emse/programming" not found in src/data/projects.ts.'
  );
}

export default function Page() {
  return <ProjectPage project={project} />;
}
