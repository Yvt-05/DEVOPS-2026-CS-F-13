import { useEffect, useState, useCallback } from "react";
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
  { number: "10+",  label: "Projects Completed" },
  { number: "15+",  label: "Years of Excellence" },
  { number: "200+", label: "Happy Clients"        },
  { number: "1+",   label: "Cities"               },
];

// ── Home Page ───────────────────────────────────────────────────────────────

function Home() {
  // ── Interactive 3D state ──
  const [immersive, setImmersive] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [duskMode, setDuskMode] = useState(true);
  const [cameraPreset, setCameraPreset] = useState(null);
  const [activePreset, setActivePreset] = useState("exterior");

  const handlePresetDone = useCallback(() => { setCameraPreset(null); }, []);

  // ESC key exits immersive mode
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && immersive) {
        setImmersive(false);
        setCameraPreset(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [immersive]);

  // Scroll reveal
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

  // Camera preset helper
  function goPreset(name) {
    setActivePreset(name);
    setCameraPreset(name);
    if (!immersive) setImmersive(true);
  }

  // Thumbnail images (first 4 projects)
  const thumbs = [
    { src: "/images/projects/project-1-main.jpg", label: "01" },
    { src: "/images/projects/project-2-main.jpg", label: "02" },
    { src: "/images/projects/project-3-main.jpg", label: "03" },
    { src: "/images/projects/project-4-main.jpg", label: "04" },
  ];

  return (
    <main>

      {/* ══════════════════════════════════════════════════════
          1. HERO SECTION — Interactive 3D Architectural Showcase
          ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-end lg:items-center px-6 lg:px-12
        pb-20 lg:pb-0 pt-28 overflow-hidden">

        {/* Atmospheric dark base */}
        <div className="absolute inset-0 bg-[#0a0a0a]" />

        {/* Subtle blueprint grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), " +
              "linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent
          to-transparent pointer-events-none" />

        {/* Left vignette */}
        <div className={`absolute inset-y-0 left-0 w-full lg:w-1/2 bg-gradient-to-r from-[#0a0a0a]/80 via-[#0a0a0a]/40 to-transparent pointer-events-none z-[5] transition-opacity duration-700 ${immersive ? 'opacity-0' : ''}`} />

        {/* Three.js 3D Architectural Scene */}
        <ThreeHeroScene
          immersive={immersive}
          showWireframe={showWireframe}
          duskMode={duskMode}
          cameraPreset={cameraPreset}
          onPresetDone={handlePresetDone}
        />

        {/* ── Hero Content — fades when immersive ── */}
        <div className={`relative z-10 max-w-lg lg:max-w-xl transition-all duration-700 ${immersive ? 'opacity-0 pointer-events-none -translate-x-8' : ''}`}>
          <p className="hero-sub text-[10px] tracking-[0.4em] uppercase text-[#b89a5a]/90 mb-6 font-medium">
            Shivakriti Constructions
          </p>

          <h1 style={{ fontFamily: "var(--font-display)" }} className="leading-[0.94]">
            <span
              className="hero-line-1 block font-light tracking-tight text-[#f3f0e8]"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4.6rem)" }}
            >
              WE BUILD THE SPACE.
            </span>
            <span
              className="hero-line-2 block font-light tracking-tight text-[#f3f0e8]/60"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4.6rem)" }}
            >
              WHERE, YOU BUILD
            </span>
            <span
              className="hero-line-2 block font-light tracking-tight text-[#f3f0e8]/60"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4.6rem)" }}
            >
              THE MEMORIES.
            </span>
          </h1>

          <p className="hero-desc mt-6 text-[15px] lg:text-base text-[#a7a29a] max-w-sm font-light leading-relaxed">
            Thoughtfully designed spaces, built for happiness, comfort, and a lifetime of moments.
          </p>

          <div className="hero-cta mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/projects"
              className="text-[10px] tracking-[0.28em] uppercase bg-[#f3f0e8] text-[#0a0a0a]
                px-7 py-3.5 font-medium hover:bg-[#b89a5a] hover:text-white transition-all duration-300
                whitespace-nowrap"
            >
              Explore Projects →
            </Link>
            <Link
              to="/contact"
              className="text-[10px] tracking-[0.28em] uppercase border border-white/15
                text-[#a7a29a] px-7 py-3.5 hover:border-[#b89a5a]/50 hover:text-[#f3f0e8] transition-all duration-300
                whitespace-nowrap"
            >
              Start a Conversation →
            </Link>
          </div>
        </div>

        {/* ── Project Thumbnails — bottom left ── */}
        <div className={`absolute bottom-6 left-6 lg:left-12 z-10 hidden lg:block transition-all duration-500 ${immersive ? 'opacity-0 pointer-events-none translate-y-4' : ''}`}>
          <div className="flex gap-2">
            {thumbs.map((t, i) => (
              <Link key={i} to={`/projects/${i + 1}`} className="group relative">
                <img
                  src={t.src}
                  alt={`Project ${t.label}`}
                  className="w-16 h-12 object-cover rounded-sm border border-white/10
                    group-hover:border-[#b89a5a]/50 transition-all duration-300 opacity-70 group-hover:opacity-100"
                />
                <span className="absolute bottom-0.5 left-1 text-[7px] text-white/40 font-medium">{t.label}</span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[8px] tracking-widest text-[#a7a29a]/40">01</span>
            <div className="w-16 h-px bg-white/10" />
            <span className="text-[8px] tracking-widest text-[#a7a29a]/40">04</span>
          </div>
        </div>

        {/* ── Bottom Control Bar ── */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 hidden lg:flex items-center gap-6">
          {/* Control hints */}
          <div className={`flex items-center gap-5 transition-all duration-500 ${immersive ? '' : 'opacity-40'}`}>
            {/* Drag to orbit */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50">
                  <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17" />
                </svg>
              </div>
              <div>
                <div className="text-[7px] tracking-[0.2em] uppercase text-white/50 font-medium">Drag</div>
                <div className="text-[7px] tracking-[0.15em] uppercase text-white/30">to orbit</div>
              </div>
            </div>

            {/* Scroll to zoom */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center">
                <svg width="10" height="14" viewBox="0 0 20 28" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50">
                  <rect x="5" y="1" width="10" height="18" rx="5" />
                  <line x1="10" y1="6" x2="10" y2="10" />
                  <path d="M7 22l3 4 3-4" />
                </svg>
              </div>
              <div>
                <div className="text-[7px] tracking-[0.2em] uppercase text-white/50 font-medium">Scroll</div>
                <div className="text-[7px] tracking-[0.15em] uppercase text-white/30">to zoom</div>
              </div>
            </div>

            {/* Arrow keys */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div>
                <div className="text-[7px] tracking-[0.2em] uppercase text-white/50 font-medium">Arrow Keys</div>
                <div className="text-[7px] tracking-[0.15em] uppercase text-white/30">to navigate</div>
              </div>
            </div>
          </div>

          {/* Enter/Exit 3D View button */}
          <button
            onClick={() => {
              setImmersive(!immersive);
              if (!immersive) goPreset("exterior");
            }}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full border transition-all duration-500 cursor-pointer ${
              immersive
                ? 'border-[#b89a5a]/40 bg-[#b89a5a]/10 hover:bg-[#b89a5a]/20'
                : 'border-[#b89a5a]/60 bg-[#b89a5a]/15 hover:bg-[#b89a5a]/30'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 border-[#b89a5a]/60 flex items-center justify-center transition-all duration-300 ${immersive ? 'bg-[#b89a5a]/20' : ''}`}>
              <div className="w-2 h-2 rounded-full bg-[#b89a5a]" />
            </div>
            <div className="text-left">
              <div className="text-[8px] tracking-[0.25em] uppercase text-[#b89a5a] font-medium">
                {immersive ? "Exit 3D View" : "Enter 3D View"}
              </div>
              <div className="text-[7px] tracking-[0.15em] uppercase text-[#b89a5a]/50">
                {immersive ? "Press ESC" : "Explore Model →"}
              </div>
            </div>
          </button>
        </div>

        {/* ── Immersive Mode UI — camera presets + toggles ── */}
        {immersive && (
          <div className="absolute top-24 right-6 lg:right-12 z-20 hidden lg:flex flex-col gap-3 animate-in fade-in">
            {/* Camera presets */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/8 rounded-sm p-3">
              <div className="text-[7px] tracking-[0.3em] uppercase text-[#b89a5a]/60 mb-2.5 font-medium">Camera View</div>
              {["exterior", "facade", "rooftop", "entrance", "structure"].map(name => (
                <button
                  key={name}
                  onClick={() => goPreset(name)}
                  className={`block w-full text-left text-[9px] tracking-[0.15em] uppercase px-2.5 py-1.5 rounded-sm transition-all duration-200 cursor-pointer ${
                    activePreset === name
                      ? 'text-[#b89a5a] bg-[#b89a5a]/10'
                      : 'text-[#a7a29a]/60 hover:text-[#f3f0e8] hover:bg-white/5'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Toggles */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/8 rounded-sm p-3 flex flex-col gap-2">
              <button
                onClick={() => setShowWireframe(!showWireframe)}
                className={`text-[8px] tracking-[0.2em] uppercase px-2.5 py-1.5 rounded-sm transition-all duration-200 text-left cursor-pointer ${
                  showWireframe ? 'text-[#b89a5a] bg-[#b89a5a]/10' : 'text-[#a7a29a]/50 hover:text-[#f3f0e8]'
                }`}
              >
                ◇ {showWireframe ? "Hide" : "Show"} Structure
              </button>
              <button
                onClick={() => setDuskMode(!duskMode)}
                className={`text-[8px] tracking-[0.2em] uppercase px-2.5 py-1.5 rounded-sm transition-all duration-200 text-left cursor-pointer ${
                  duskMode ? 'text-[#b89a5a] bg-[#b89a5a]/10' : 'text-[#a7a29a]/50 hover:text-[#f3f0e8]'
                }`}
              >
                ◎ {duskMode ? "Dusk" : "Day"} Mode
              </button>
            </div>
          </div>
        )}

        {/* Scroll indicator — hidden in immersive mode */}
        <div className={`absolute bottom-8 right-12 hidden lg:flex flex-col items-center gap-3 transition-opacity duration-500 ${immersive ? 'opacity-0' : ''}`}>
          <p className="text-[8px] tracking-[0.35em] text-[#a7a29a]/40 uppercase"
            style={{ writingMode: "vertical-lr" }}>
            Scroll
          </p>
          <div className="w-px h-12 bg-white/8" />
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

        {/* ── Project 04 — Info left, image right with gallery preview count ── */}
        <div className="reveal border-t border-white/5 px-6 lg:px-12 py-16">
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-2 flex flex-col justify-between gap-8">
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="text-[5.5rem] font-light leading-none text-white/8 select-none"
              >
                04
              </p>
              <div>
                <p className="text-[9px] tracking-widest text-neutral-600 uppercase mb-3">
                  {projects[3].type} · {projects[3].year} · {projects[3].status}
                </p>
                <h3
                  style={{ fontFamily: "var(--font-display)" }}
                  className="text-4xl lg:text-5xl font-light"
                >
                  {projects[3].title}
                </h3>
                <p className="mt-2 text-sm text-neutral-500">{projects[3].location}</p>
                <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
                  {projects[3].description.slice(0, 120)}…
                </p>
                <Link
                  to={`/projects/${projects[3].id}`}
                  className="mt-8 inline-flex items-center gap-3 text-[10px]
                    tracking-[0.3em] uppercase text-neutral-500 hover:text-white
                    transition-colors group"
                >
                  Explore Project ({projects[3].gallery.length} Photos)
                  <span className="h-px w-6 bg-white/25 group-hover:w-10 transition-all
                    duration-400" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-3 img-wrap aspect-[16/10] bg-neutral-900 border border-white/5">
              <img
                src={projects[3].image}
                alt={projects[3].title}
                className="opacity-80"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          </div>
        </div>

        {/* ── Project 05 — Image left, info right ── */}
        <div className="reveal border-t border-white/5 px-6 lg:px-12 py-16">
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3 img-wrap aspect-[16/9] bg-neutral-900 border border-white/5">
              <img
                src={projects[4].image}
                alt={projects[4].title}
                className="opacity-80"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>

            <div className="lg:col-span-2 lg:pl-8">
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="text-[5.5rem] font-light leading-none text-white/8 mb-6 select-none"
              >
                05
              </p>
              <p className="text-[9px] tracking-widest text-neutral-600 uppercase mb-3">
                {projects[4].type} · {projects[4].year} · {projects[4].status}
              </p>
              <h3
                style={{ fontFamily: "var(--font-display)" }}
                className="text-4xl lg:text-5xl font-light"
              >
                {projects[4].title}
              </h3>
              <p className="mt-2 text-sm text-neutral-500">{projects[4].location}</p>
              <p className="mt-6 text-sm text-neutral-600 leading-relaxed">
                {projects[4].description.slice(0, 110)}…
              </p>
              <Link
                to={`/projects/${projects[4].id}`}
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