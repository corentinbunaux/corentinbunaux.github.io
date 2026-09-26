import { projects } from "../../data/projects";
import { ProjectPage } from "../../components/ProjectPage";

const project = projects.find((p) => p.href === "cpge_tipe");

if (!project) {
  throw new Error('Project "cpge_tipe" not found in src/data/projects.ts.');
}

export default function Page() {
  return <ProjectPage project={project} />;
}
