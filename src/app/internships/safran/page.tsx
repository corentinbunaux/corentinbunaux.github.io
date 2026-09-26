import { projects } from "../../../data/projects";
import { ProjectPage } from "../../../components/ProjectPage";

const project = projects.find((p) => p.href === "internships/safran");

if (!project) {
  throw new Error(
    'Project "internships/safran" not found in src/data/projects.ts.'
  );
}

export default function Page() {
  return <ProjectPage project={project} />;
}