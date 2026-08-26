import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import projects from "../data/projects";

// Construction stages shown on every project detail page
const constructionStages = [
  { num: "01", stage: "Concept & Design",      desc: "Architectural vision and structural planning" },
  { num: "02", stage: "Foundation",             desc: "Excavation, soil treatment, and concrete foundation" },
  { num: "03", stage: "Structure",              desc: "RCC frame, columns, beams, and slab casting" },
  { num: "04", stage: "Exterior & Finishing",   desc: "Facade, plumbing, electrical, and interior works" },
  { num: "05", stage: "Completion",             desc: "Final inspections, quality checks, and handover" },
];

function ProjectDetails() {
  // Get the project id from the URL, e.g. /projects/2 → id = "2"
  const { id } = useParams();
  const project = projects.find((p) => p.id === Number(id));

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // 404 state
  if (!project) {
    return (
      <main className="min-h-screen px-6 lg:px-12 pt-40">
        <p className="text-[9px] tracking-[0.4em] uppercase text-neutral-600 mb-6">
          404
        </p>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-6xl font-light mb-10"
        >
          Project not found.
        </h1>
        <Link
          to="/projects"
          className="text-[10px] tracking-[0.3em] uppercase text-neutral-500
            hover:text-white transition-colors"
        >
          ← Back to Projects
        </Link>
      </main>
    );
  }

  return (
    <main>

      {/* ── 1. Project Hero ── */}
      <section className="relative min-h-[70vh] flex flex-col justify-end px-6 lg:px-12
        pb-20 pt-32 overflow-hidden">

        {/* Background image with dark overlay */}
        <div className="absolute inset-0 bg-neutral-900">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover opacity-45"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          {/* Gradient fades the image into the page below */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70
            to-[#0a0a0a]/20" />
        </div>

        {/* Project header text */}
        <div className="relative z-10">
          <Link
            to="/projects"
            className="hero-sub text-[9px] tracking-[0.35em] uppercase text-neutral-500
              hover:text-white transition-colors mb-12 inline-block"
          >
            ← All Projects
          </Link>

          <p className="hero-sub text-[9px] tracking-widest uppercase text-neutral-500 mb-4">
            {project.type} · {project.year} · {project.status}
          </p>

          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="hero-line-1 text-6xl lg:text-8xl font-light leading-tight"
          >
            {project.title}
          </h1>
          <p className="hero-line-2 mt-3 text-sm text-neutral-400">
            {project.location}
          </p>
        </div>
      </section>

      {/* ── 2. Project Info ── */}
      <section className="py-24 px-6 lg:px-12 border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Description */}
          <div>
            <p className="reveal text-[9px] tracking-[0.4em] uppercase text-neutral-600 mb-6">
              About This Project
            </p>
            <p className="reveal reveal-delay-1 text-lg text-neutral-300 leading-9">
              {project.description}
            </p>
          </div>

          {/* Project metadata */}
          <div className="reveal reveal-delay-2 grid grid-cols-2 gap-10 lg:pt-10">
            {[
              { label: "Type",     value: project.type     },
              { label: "Location", value: project.location },
              { label: "Year",     value: project.year     },
              { label: "Status",   value: project.status   },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[9px] tracking-widest uppercase text-neutral-600 mb-2">
                  {label}
                </p>
                <p className="text-sm text-neutral-300">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Full-width cinematic project image ── */}
      <div className="img-wrap w-full aspect-[21/9] bg-neutral-900">
        <img
          src={project.image}
          alt={`${project.title} — full view`}
          className="opacity-70"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>

      {/* ── 4. Construction Journey Timeline ── */}
      <section className="py-24 px-6 lg:px-12 border-t border-white/5">
        <p className="reveal text-[9px] tracking-[0.4em] uppercase text-neutral-600 mb-6">
          How It Was Built
        </p>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="reveal reveal-delay-1 text-4xl lg:text-6xl font-light mb-16"
        >
          Construction Journey
        </h2>

        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-0 divide-y sm:divide-y-0
          sm:divide-x divide-white/5">
          {constructionStages.map(({ num, stage, desc }, i) => (
            <div key={num} className={`reveal reveal-delay-${i + 1} p-8`}>
              <p className="text-[9px] tracking-[0.35em] text-[#b8956a] uppercase mb-6">
                {num}
              </p>
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="text-xl font-light mb-3"
              >
                {stage}
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Enquiry CTA ── */}
      <section className="py-36 px-6 lg:px-12 border-t border-white/5 text-center">
        <p className="reveal text-[9px] tracking-[0.45em] uppercase text-neutral-600 mb-8">
          Interested in a similar project?
        </p>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="reveal reveal-delay-1 text-5xl lg:text-7xl font-light mb-12"
        >
          Let's build together.
        </h2>
        <Link
          to="/contact"
          className="reveal reveal-delay-2 inline-block text-[10px] tracking-[0.4em]
            uppercase border border-white/22 px-10 py-4 hover:bg-white
            hover:text-[#0a0a0a] transition-all duration-400"
        >
          Send Enquiry →
        </Link>
      </section>

    </main>
  );
}

export default ProjectDetails;