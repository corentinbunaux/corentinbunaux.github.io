import { projects } from "../../../data/projects";
import { ProjectPage } from "../../../components/ProjectPage";

const project = projects.find((p) => p.href === "internships/quimesis");

if (!project) {
  throw new Error(
    'Project "internships/quimesis" not found in src/data/projects.ts.'
  );
}

export default function Page() {
  return <ProjectPage project={project} />;
}
