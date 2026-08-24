import { Link } from "react-router-dom";
import projects from "../data/projects";

function Projects() {
  return (
    <main className="min-h-screen px-6 py-20">
      <h1 className="mb-12 text-5xl font-semibold">Our Projects</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="rounded-2xl border border-white/10 p-6 transition hover:border-white/30"
          >
            <p className="mb-2 text-sm text-neutral-400">
              {project.type} · {project.year}
            </p>
            <h2 className="text-3xl font-medium">{project.title}</h2>
            <p className="mt-2 text-neutral-400">{project.location}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default Projects;