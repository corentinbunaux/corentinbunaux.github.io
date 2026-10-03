import { projects } from "../data/projects";
import { loadArticle } from "../lib/articles";
import { HomeShell } from "../components/HomeShell";
import "./app.css";

export default function Home() {
  const excerpts = Object.fromEntries(
    projects.map((project) => {
      const article = loadArticle(project.href);
      return [
        project.href,
        {
          fr: article.fr[0]?.paragraphs[0] ?? "",
          en: article.en[0]?.paragraphs[0] ?? "",
        },
      ];
    }),
  );

  return <HomeShell excerpts={excerpts} />;
}
