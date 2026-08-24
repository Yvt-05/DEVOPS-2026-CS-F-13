import { useParams } from "react-router-dom";
import projects from "../data/projects";

function ProjectDetails() {
  const { id } = useParams();
  const project = projects.find((item) => item.id === Number(id));

  if (!project) {
    return (
      <main className="min-h-screen px-6 py-20">
        <h1 className="text-4xl font-semibold">Project not found</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-20">
      <p className="mb-3 text-sm uppercase tracking-widest text-neutral-400">
        {project.type} · {project.year}
      </p>
      <h1 className="text-6xl font-semibold">{project.title}</h1>
      <p className="mt-4 text-neutral-400">{project.location}</p>

      <div className="mt-12 max-w-3xl">
        <p className="text-lg leading-8 text-neutral-300">
          {project.description}
        </p>
      </div>
    </main>
  );
}

export default ProjectDetails;