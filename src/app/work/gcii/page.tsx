import { projects } from "../../../data/projects";
import { ProjectPage } from "../../../components/ProjectPage";

const project = projects.find((p) => p.href === "work/gcii");

if (!project) {
  throw new Error('Project "work/gcii" not found in src/data/projects.ts.');
}

export default function Page() {
  return <ProjectPage project={project} />;
}
