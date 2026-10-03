import { projects } from "../../../data/projects";
import { ProjectPage } from "../../../components/ProjectPage";
import { loadArticle } from "../../../lib/articles";

const project = projects.find((p) => p.href === "personnal/web");

if (!project) {
  throw new Error(
    'Project "personnal/web" not found in src/data/projects.ts.'
  );
}

const article = loadArticle(project.href);

export default function Page() {
  return <ProjectPage project={project} article={article} />;
}
