import { useEffect } from "react";
import { Link } from "react-router-dom";
import projects from "../data/projects";

function Projects() {
  // Scroll reveal — same pattern used across all pages
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

  return (
    <main className="pt-32">

      {/* ── Page Header ── */}
      <div className="px-6 lg:px-12 pb-20 border-b border-white/5">
        <p className="hero-sub text-[9px] tracking-[0.45em] uppercase text-neutral-500 mb-6">
          Our Work
        </p>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="hero-line-1 text-6xl lg:text-8xl font-light leading-tight"
        >
          All Projects
        </h1>
      </div>

      {/* ── Projects List — Editorial alternating layouts ── */}
      <div>
        {projects.map((project, index) => (
          <article key={project.id} className="border-b border-white/5">
            <Link
              to={`/projects/${project.id}`}
              className="group block px-6 lg:px-12 py-20"
            >
              {/*
                On odd-indexed projects (index 1, 3...) the image is on the left.
                On even-indexed (index 0, 2...) the image is on the right.
                This creates an alternating editorial layout.
              */}
              <div className="grid lg:grid-cols-5 gap-10 items-center">

                {/* Text column — swaps order on odd rows via lg:order-2 */}
                <div className={`lg:col-span-2 flex flex-col gap-6
                  ${index % 2 === 1 ? "lg:order-2" : ""}`}>

                  <p
                    style={{ fontFamily: "var(--font-display)" }}
                    className="text-[5rem] font-light leading-none text-white/8 select-none"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <div>
                    <p className="text-[9px] tracking-widest text-neutral-600 uppercase mb-3">
                      {project.type} · {project.year} · {project.status}
                    </p>
                    <h2
                      style={{ fontFamily: "var(--font-display)" }}
                      className="text-4xl lg:text-5xl font-light group-hover:text-[#b8956a]
                        transition-colors duration-500"
                    >
                      {project.title}
                    </h2>
                    <p className="mt-2 text-sm text-neutral-500">{project.location}</p>

                    <p className="mt-6 text-sm text-neutral-600 leading-relaxed max-w-sm">
                      {project.description.slice(0, 120)}…
                    </p>

                    <span
                      className="mt-8 inline-flex items-center gap-3 text-[10px]
                        tracking-[0.3em] uppercase text-neutral-600 group-hover:text-white
                        transition-colors"
                    >
                      View Project
                      <span className="h-px w-6 bg-white/20 group-hover:w-10 transition-all
                        duration-400" />
                    </span>
                  </div>
                </div>

                {/* Image column — swaps order on odd rows via lg:order-1 */}
                <div
                  className={`lg:col-span-3 img-wrap bg-neutral-900 border border-white/5
                    ${index % 2 === 1 ? "lg:order-1" : ""}
                    ${index === 1 ? "aspect-[16/9]" : "aspect-[4/3]"}`}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="opacity-75 group-hover:opacity-100 transition-opacity
                      duration-500"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* ── Enquiry CTA ── */}
      <section className="py-36 px-6 lg:px-12 text-center border-t border-white/5">
        <p className="reveal text-[9px] tracking-[0.45em] uppercase text-neutral-600 mb-8">
          Have a project in mind?
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

export default Projects;