import "../app/app.css";
import Link from "next/link";
import { projects } from "../data/projects";
import { OptimizedImage } from "./optimizedImage";

const ProjectCard = ({ project }) => (
  <div className="p-4">
    <Link
      href={`/${project.href}`}
      className="relative h-full w-full fulldiv cursor-pointer"
    >
      {project.img && (
        <OptimizedImage
          src={project.img}
          alt={project.title}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="absolute h-full w-full rounded-lg object-cover opacity-50 project-card-img"
        />
      )}
      <div className="flex flex-col justify-around items-center border border-second h-full rounded-lg w-full">
        <h1 className="title">{project.title}</h1>
        <h3 className="description">{project.description}</h3>
      </div>
    </Link>
  </div>
);

function ProjectsSection() {
  return (
    <section
      id="section-portfolio"
      className="flex justify-center items-center h-full"
    >
      <div className="container h-5/6 p-5">
        <h1 className="outlined-text">Portfolio</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-full">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectsSection;
