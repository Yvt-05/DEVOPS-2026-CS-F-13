import { useEffect } from "react";
import { Link } from "react-router-dom";
import projects from "../data/projects";
import ThreeHeroScene from "../components/ThreeHeroScene";

// ── Section Data ────────────────────────────────────────────────────────────

const capabilities = [
  {
    num: "01",
    title: "Residential",
    desc: "Premium homes and housing complexes designed for modern living — from compact apartments to expansive villas.",
  },
  {
    num: "02",
    title: "Commercial",
    desc: "Functional, impressive commercial spaces — offices, showrooms, and retail developments built to last.",
  },
  {
    num: "03",
    title: "Industrial",
    desc: "Purpose-built industrial structures combining structural durability with operational efficiency.",
  },
  {
    num: "04",
    title: "Renovation",
    desc: "Thoughtful renovation and restoration that breathes new life into existing structures.",
  },
];

const journey = [
  { num: "01", stage: "Concept",   desc: "Architectural vision and client consultation" },
  { num: "02", stage: "Foundation", desc: "Soil study, excavation, and foundation laying"  },
  { num: "03", stage: "Structure",  desc: "RCC frame, columns, beams, and slab work"        },
  { num: "04", stage: "Exterior",   desc: "Facade, finishing, plumbing, and electrical"     },
  { num: "05", stage: "Completed",  desc: "Quality checks and client handover"              },
];

// NOTE: Replace these with actual company statistics when provided
const stats = [
  { number: "50+",  label: "Projects Completed" },
  { number: "10+",  label: "Years of Excellence" },
  { number: "200+", label: "Happy Clients"        },
  { number: "3",    label: "Cities"               },
];

// ── Home Page ───────────────────────────────────────────────────────────────

function Home() {
  // Scroll reveal: IntersectionObserver adds "visible" class when an element
  // with class "reveal" enters the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main>

      {/* ══════════════════════════════════════════════════════
          1. HERO SECTION
          Full-screen cinematic hero with architectural grid
          background. Three.js scene replaces the wireframe
          placeholder in Phase 3.
          ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-end px-6 lg:px-12
        pb-28 pt-32 overflow-hidden">

        {/* Subtle architectural blueprint grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), " +
              "linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Gradient — fades the grid into the solid dark background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent
          to-transparent pointer-events-none" />

        {/* ── Three.js Architectural Scene ──
            Absolute positioned, fills the hero background.
            pointer-events-none so the hero text stays clickable. */}
        <ThreeHeroScene />

        {/* Hero text content */}
        <div className="relative z-10 max-w-5xl">
          <p className="hero-sub text-[9px] tracking-[0.5em] uppercase text-neutral-500 mb-10">
            Construction &amp; Architecture
          </p>

          <h1 style={{ fontFamily: "var(--font-display)" }} className="leading-none">
            <span
              className="hero-line-1 block font-light tracking-tight text-white"
              style={{ fontSize: "clamp(4rem, 10vw, 9.5rem)" }}
            >
              WE BUILD.
            </span>
            <span
              className="hero-line-2 block font-light tracking-tight text-white/70"
              style={{ fontSize: "clamp(4rem, 10vw, 9.5rem)" }}
            >
              YOU BELIEVE.
            </span>
          </h1>

          <div className="hero-cta mt-14 flex flex-col sm:flex-row items-start
            sm:items-center gap-8">
            <Link
              to="/projects"
              className="text-[10px] tracking-[0.35em] uppercase border border-white/22
                px-8 py-4 hover:bg-white hover:text-[#0a0a0a] transition-all duration-400
                whitespace-nowrap"
            >
              Explore Projects →
            </Link>
            <p className="text-sm text-neutral-600 max-w-xs leading-relaxed">
              Premium construction across Rajasthan — where vision meets craftsmanship.
            </p>
          </div>
        </div>

        {/* Vertical scroll indicator */}
        <div className="absolute bottom-10 right-12 hidden lg:flex flex-col items-center gap-4">
          <p className="text-[8px] tracking-[0.4em] text-neutral-700 uppercase"
            style={{ writingMode: "vertical-lr" }}>
            Scroll
          </p>
          <div className="w-px h-16 bg-white/10" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. COMPANY INTRODUCTION
          ══════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 lg:px-12 border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-28 items-start">

          <div>
            <p className="reveal text-[9px] tracking-[0.45em] uppercase text-[#b8956a] mb-8">
              About Shivakriti Constructions
            </p>
            <h2
              style={{ fontFamily: "var(--font-display)" }}
              className="reveal reveal-delay-1 text-5xl lg:text-[4.5rem] font-light
                leading-tight"
            >
              Building spaces<br />that endure.
            </h2>
          </div>

          <div className="lg:pt-24">
            <p className="reveal reveal-delay-2 text-neutral-300 text-base leading-9">
              Shivakriti Constructions is a premium construction company delivering
              architectural excellence across Rajasthan. We bring together skilled
              craftspeople, modern techniques, and an uncompromising commitment to quality
              in every project we undertake.
            </p>
            <p className="reveal reveal-delay-3 text-neutral-600 text-sm leading-8 mt-6">
              Every structure we build is a testament to our belief that great buildings
              shape great lives — built to last, designed to inspire.
            </p>
            <Link
              to="/about"
              className="reveal reveal-delay-4 mt-10 inline-flex items-center gap-4
                text-[10px] tracking-[0.35em] uppercase text-neutral-500 hover:text-white
                transition-colors group"
            >
              Learn About Us
              <span className="h-px w-8 bg-white/25 group-hover:w-14 transition-all
                duration-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. SELECTED PROJECTS
          Three editorial project layouts — each different.
          ══════════════════════════════════════════════════════ */}
      <section className="border-t border-white/5 pt-20">

        <div className="px-6 lg:px-12 mb-16 flex items-center justify-between">
          <p className="reveal text-[9px] tracking-[0.45em] uppercase text-neutral-500">
            Selected Projects
          </p>
          <Link
            to="/projects"
            className="reveal text-[10px] tracking-[0.3em] uppercase text-neutral-600
              hover:text-white transition-colors"
          >
            View All →
          </Link>
        </div>

        {/* ── Project 01 — Number + info left, large image right ── */}
        <div className="reveal border-t border-white/5 px-6 lg:px-12 py-16">
          <div className="grid lg:grid-cols-5 gap-8 items-end">

            <div className="lg:col-span-2 flex flex-col justify-between gap-8">
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="text-[5.5rem] font-light leading-none text-white/8 select-none"
              >
                01
              </p>
              <div>
                <p className="text-[9px] tracking-widest text-neutral-600 uppercase mb-3">
                  {projects[0].type} · {projects[0].year} · {projects[0].status}
                </p>
                <h3
                  style={{ fontFamily: "var(--font-display)" }}
                  className="text-4xl lg:text-5xl font-light"
                >
                  {projects[0].title}
                </h3>
                <p className="mt-2 text-sm text-neutral-500">{projects[0].location}</p>
                <Link
                  to={`/projects/${projects[0].id}`}
                  className="mt-8 inline-flex items-center gap-3 text-[10px]
                    tracking-[0.3em] uppercase text-neutral-500 hover:text-white
                    transition-colors group"
                >
                  Explore Project
                  <span className="h-px w-6 bg-white/25 group-hover:w-10 transition-all
                    duration-400" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-3 img-wrap aspect-[4/3] bg-neutral-900
              border border-white/5">
              <img
                src={projects[0].image}
                alt={projects[0].title}
                className="opacity-80"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          </div>
        </div>

        {/* ── Project 02 — Image left, info right (alternating) ── */}
        <div className="reveal border-t border-white/5 px-6 lg:px-12 py-16">
          <div className="grid lg:grid-cols-5 gap-8 items-center">

            <div className="lg:col-span-3 img-wrap aspect-[16/9] bg-neutral-900
              border border-white/5">
              <img
                src={projects[1].image}
                alt={projects[1].title}
                className="opacity-80"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>

            <div className="lg:col-span-2 lg:pl-8">
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="text-[5.5rem] font-light leading-none text-white/8 mb-6
                  select-none"
              >
                02
              </p>
              <p className="text-[9px] tracking-widest text-neutral-600 uppercase mb-3">
                {projects[1].type} · {projects[1].year} · {projects[1].status}
              </p>
              <h3
                style={{ fontFamily: "var(--font-display)" }}
                className="text-4xl lg:text-5xl font-light"
              >
                {projects[1].title}
              </h3>
              <p className="mt-2 text-sm text-neutral-500">{projects[1].location}</p>
              <p className="mt-6 text-sm text-neutral-600 leading-relaxed">
                {projects[1].description.slice(0, 110)}…
              </p>
              <Link
                to={`/projects/${projects[1].id}`}
                className="mt-8 inline-flex items-center gap-3 text-[10px]
                  tracking-[0.3em] uppercase text-neutral-500 hover:text-white
                  transition-colors group"
              >
                Explore Project
                <span className="h-px w-6 bg-white/25 group-hover:w-10 transition-all
                  duration-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Project 03 — Header row, then full-width cinematic image ── */}
        <div className="reveal border-t border-white/5 px-6 lg:px-12 pt-16 pb-2">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-8">
            <p
              style={{ fontFamily: "var(--font-display)" }}
              className="text-[5.5rem] font-light leading-none text-white/8 select-none"
            >
              03
            </p>
            <div className="lg:pb-3">
              <p className="text-[9px] tracking-widest text-neutral-600 uppercase mb-2">
                {projects[2].type} · {projects[2].year} · {projects[2].status}
              </p>
              <h3
                style={{ fontFamily: "var(--font-display)" }}
                className="text-4xl lg:text-5xl font-light"
              >
                {projects[2].title}
              </h3>
              <p className="mt-1 text-sm text-neutral-500">{projects[2].location}</p>
            </div>
            <Link
              to={`/projects/${projects[2].id}`}
              className="lg:ml-auto lg:self-end text-[10px] tracking-[0.3em] uppercase
                text-neutral-500 hover:text-white transition-colors border border-white/10
                px-6 py-3 hover:border-white/30 whitespace-nowrap"
            >
              Explore →
            </Link>
          </div>
          {/* Full-width cinematic image */}
          <div className="img-wrap w-full aspect-[21/9] bg-neutral-900 border border-white/5">
            <img
              src={projects[2].image}
              alt={projects[2].title}
              className="opacity-80"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. CAPABILITIES
          ══════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 lg:px-12 border-t border-white/5">
        <div className="mb-16">
          <p className="reveal text-[9px] tracking-[0.45em] uppercase text-neutral-500 mb-5">
            What We Build
          </p>
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="reveal reveal-delay-1 text-5xl lg:text-6xl font-light"
          >
            Our Capabilities
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0
          sm:divide-x divide-white/5">
          {capabilities.map(({ num, title, desc }, i) => (
            <div
              key={num}
              className={`reveal reveal-delay-${i + 1} group p-8 cursor-default`}
            >
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="text-5xl font-light text-white/8 mb-8 select-none"
              >
                {num}
              </p>
              <h3
                style={{ fontFamily: "var(--font-display)" }}
                className="text-2xl font-light mb-4 group-hover:text-[#b8956a]
                  transition-colors duration-400"
              >
                {title}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. CONSTRUCTION JOURNEY
          ══════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 lg:px-12 border-t border-white/5">
        <div className="mb-16">
          <p className="reveal text-[9px] tracking-[0.45em] uppercase text-neutral-500 mb-5">
            How We Work
          </p>
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="reveal reveal-delay-1 text-5xl lg:text-6xl font-light"
          >
            The Construction Journey
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-0 divide-y sm:divide-y-0
          sm:divide-x divide-white/5">
          {journey.map(({ num, stage, desc }, i) => (
            <div key={num} className={`reveal reveal-delay-${i + 1} p-8`}>
              <p className="text-[9px] tracking-[0.35em] text-[#b8956a] uppercase mb-6">
                {num}
              </p>
              <h3
                style={{ fontFamily: "var(--font-display)" }}
                className="text-xl font-light mb-3"
              >
                {stage}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. STATISTICS / COMPANY INFORMATION
          NOTE: Replace with actual company statistics.
          ══════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 lg:px-12 border-t border-white/5 bg-[#0d0d0d]">
        <p className="reveal text-[9px] tracking-[0.45em] uppercase text-neutral-600 mb-16">
          By the Numbers
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0
          lg:divide-x divide-white/5">
          {stats.map(({ number, label }, i) => (
            <div
              key={label}
              className={`reveal reveal-delay-${i + 1} text-center lg:text-left lg:px-12`}
            >
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="text-6xl lg:text-7xl font-light text-white mb-3"
              >
                {number}
              </p>
              <p className="text-[9px] tracking-widest uppercase text-neutral-600">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          7. FINAL CONTACT CTA
          ══════════════════════════════════════════════════════ */}
      <section className="py-40 px-6 lg:px-12 border-t border-white/5 text-center">
        <p className="reveal text-[9px] tracking-[0.45em] uppercase text-neutral-600 mb-8">
          Start a Project
        </p>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="reveal reveal-delay-1 text-6xl lg:text-8xl font-light leading-tight
            mb-14"
        >
          Let's Build<br />Something.
        </h2>
        <Link
          to="/contact"
          className="reveal reveal-delay-2 inline-block text-[10px] tracking-[0.4em]
            uppercase border border-white/22 px-12 py-5 hover:bg-white
            hover:text-[#0a0a0a] transition-all duration-400"
        >
          Send Enquiry →
        </Link>
      </section>

    </main>
  );
}

export default Home;