import { useEffect } from "react";
import { Link } from "react-router-dom";

// NOTE: Replace with actual company information when provided.

const values = [
  {
    num: "01",
    title: "Integrity",
    desc: "We believe in complete transparency — with our clients, our partners, and ourselves. Every commitment we make, we keep.",
  },
  {
    num: "02",
    title: "Craftsmanship",
    desc: "Quality is not a feature — it is our foundation. Every detail of every structure reflects our commitment to excellence.",
  },
  {
    num: "03",
    title: "Vision",
    desc: "We don't just build structures. We build spaces that inspire the people who live and work in them.",
  },
  {
    num: "04",
    title: "Timeliness",
    desc: "We respect your time as much as your investment. On-schedule delivery is part of our professional commitment.",
  },
];

const expertise = [
  "Residential Construction",
  "Commercial Developments",
  "Industrial Structures",
  "Luxury Villas",
  "Renovation & Restoration",
  "Structural Consulting",
];

function About() {
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

  return (
    <main className="pt-32">

      {/* ── Page Header ── */}
      <div className="px-6 lg:px-12 pb-20 border-b border-white/5">
        <p className="hero-sub text-[9px] tracking-[0.45em] uppercase text-neutral-500 mb-6">
          About Us
        </p>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="hero-line-1 text-6xl lg:text-8xl font-light leading-tight max-w-4xl"
        >
          Building with purpose.
        </h1>
      </div>

      {/* ── 1. Who We Are ── */}
      <section className="py-28 px-6 lg:px-12 border-b border-white/5">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          <div>
            <p className="reveal text-[9px] tracking-[0.45em] uppercase text-[#b8956a] mb-8">
              Who We Are
            </p>
            <h2
              style={{ fontFamily: "var(--font-display)" }}
              className="reveal reveal-delay-1 text-5xl lg:text-6xl font-light leading-tight"
            >
              Shivakriti<br />Constructions
            </h2>
          </div>

          <div className="lg:pt-20">
            {/* NOTE: Replace with actual company history */}
            <p className="reveal reveal-delay-2 text-neutral-300 text-base leading-9">
              Shivakriti Constructions is a premium construction company based in Rajasthan,
              dedicated to delivering architectural excellence and construction quality in
              every project we undertake.
            </p>
            <p className="reveal reveal-delay-3 text-neutral-600 text-sm leading-8 mt-6">
              From residential homes to large commercial complexes, we bring together skilled
              craftspeople, modern construction techniques, and an uncompromising eye for
              detail to create structures that endure.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Our Approach ── */}
      <section className="py-28 px-6 lg:px-12 border-b border-white/5">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          <p className="reveal text-[9px] tracking-[0.45em] uppercase text-neutral-500">
            Our Approach
          </p>

          <div>
            <p className="reveal text-neutral-300 text-lg leading-9">
              Every project begins with listening. Before we break ground, we ensure we
              understand not just the technical requirements, but the vision behind them.
            </p>
            <p className="reveal reveal-delay-1 text-neutral-400 text-base leading-8 mt-6">
              We combine modern structural engineering with time-tested construction methods,
              ensuring that each building is not only beautiful but structurally sound for
              generations to come.
            </p>
            <p className="reveal reveal-delay-2 text-neutral-600 text-sm leading-8 mt-6">
              From concept to completion, we maintain close communication with every client,
              ensuring the final structure exceeds expectations in quality and design.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Our Values ── */}
      <section className="py-28 px-6 lg:px-12 border-b border-white/5">
        <p className="reveal text-[9px] tracking-[0.45em] uppercase text-neutral-500 mb-16">
          Our Values
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0
          sm:divide-x divide-white/5">
          {values.map(({ num, title, desc }, i) => (
            <div key={num} className={`reveal reveal-delay-${i + 1} p-8`}>
              <p className="text-[9px] tracking-[0.35em] text-[#b8956a] uppercase mb-6">
                {num}
              </p>
              <h3
                style={{ fontFamily: "var(--font-display)" }}
                className="text-2xl font-light mb-4"
              >
                {title}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Our Expertise ── */}
      <section className="py-28 px-6 lg:px-12 border-b border-white/5">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          <div>
            <p className="reveal text-[9px] tracking-[0.45em] uppercase text-neutral-500 mb-8">
              Our Expertise
            </p>
            <h2
              style={{ fontFamily: "var(--font-display)" }}
              className="reveal reveal-delay-1 text-5xl lg:text-6xl font-light leading-tight"
            >
              What We<br />Build Best
            </h2>
          </div>

          <div className="lg:pt-8 divide-y divide-white/5">
            {expertise.map((item, i) => (
              <div
                key={item}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)} py-5 flex items-center
                  justify-between`}
              >
                <span
                  style={{ fontFamily: "var(--font-display)" }}
                  className="text-xl font-light text-neutral-200"
                >
                  {item}
                </span>
                <span className="text-[9px] tracking-widest text-neutral-700 uppercase">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Contact CTA ── */}
      <section className="py-36 px-6 lg:px-12 text-center">
        <p className="reveal text-[9px] tracking-[0.45em] uppercase text-neutral-600 mb-8">
          Ready to Start?
        </p>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="reveal reveal-delay-1 text-5xl lg:text-7xl font-light mb-12"
        >
          Let's build your vision.
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

export default About;