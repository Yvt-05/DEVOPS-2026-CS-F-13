import { useState } from "react";

function Contact() {
  // Form field values stored in one state object
  const [form, setForm] = useState({
    name:        "",
    email:       "",
    phone:       "",
    projectType: "Residential",
    location:    "",
    budget:      "",
    message:     "",
  });

  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState("");

  // Updates one field at a time by using the input's name attribute
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      /*
        Phase 4: Replace the simulated delay below with a real API call:

        const response = await fetch("/api/enquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error("Server error");
      */

      // Simulated network delay for Phase 1 (no backend yet)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  }

  // Shared Tailwind classes for all form inputs
  const inputClass =
    "w-full bg-transparent border-b border-white/12 py-4 text-sm text-white " +
    "placeholder-neutral-700 focus:outline-none focus:border-white/40 transition-colors";

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center px-6 text-center">
        <p className="text-[9px] tracking-[0.45em] uppercase text-[#b8956a] mb-6">
          Enquiry Sent
        </p>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-6xl lg:text-8xl font-light mb-8"
        >
          Thank you.
        </h1>
        <p className="text-neutral-500 text-sm max-w-sm leading-relaxed">
          We've received your enquiry and will get back to you shortly to discuss your project.
        </p>
      </main>
    );
  }

  // ── Main Form ──────────────────────────────────────────────────────────────
  return (
    <main className="pt-32 min-h-screen">

      {/* ── Page Header ── */}
      <div className="px-6 lg:px-12 pb-20 border-b border-white/5">
        <p className="hero-sub text-[9px] tracking-[0.45em] uppercase text-neutral-500 mb-6">
          Start a Project
        </p>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="hero-line-1 text-6xl lg:text-8xl font-light leading-tight"
        >
          Let's Build<br />Something.
        </h1>
      </div>

      <div className="px-6 lg:px-12 py-20 grid lg:grid-cols-2 gap-20">

        {/* ── Left: Contact Information ── */}
        <div>
          <p className="text-[9px] tracking-[0.45em] uppercase text-neutral-600 mb-12">
            Get In Touch
          </p>

          {/* NOTE: Replace with actual contact details */}
          <div className="flex flex-col gap-10">
            {[
              { label: "Email",    value: "contact@shivakriti.com" },
              { label: "Phone",    value: "+91 00000 00000"        },
              { label: "Location", value: "Jaipur, Rajasthan"      },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[9px] tracking-widest uppercase text-neutral-700 mb-2">
                  {label}
                </p>
                <p className="text-sm text-neutral-400">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Enquiry Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* Row 1 — Name + Email */}
          <div className="grid sm:grid-cols-2 gap-8">
            <label className="flex flex-col gap-2">
              <span className="text-[9px] tracking-widest uppercase text-neutral-600">
                Name *
              </span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[9px] tracking-widest uppercase text-neutral-600">
                Email *
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className={inputClass}
              />
            </label>
          </div>

          {/* Row 2 — Phone + Project Type */}
          <div className="grid sm:grid-cols-2 gap-8">
            <label className="flex flex-col gap-2">
              <span className="text-[9px] tracking-widest uppercase text-neutral-600">
                Phone
              </span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 00000 00000"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[9px] tracking-widest uppercase text-neutral-600">
                Project Type
              </span>
              <select
                name="projectType"
                value={form.projectType}
                onChange={handleChange}
                className={inputClass + " bg-transparent"}
              >
                <option className="bg-[#0a0a0a]">Residential</option>
                <option className="bg-[#0a0a0a]">Commercial</option>
                <option className="bg-[#0a0a0a]">Industrial</option>
                <option className="bg-[#0a0a0a]">Renovation</option>
              </select>
            </label>
          </div>

          {/* Row 3 — Location + Budget */}
          <div className="grid sm:grid-cols-2 gap-8">
            <label className="flex flex-col gap-2">
              <span className="text-[9px] tracking-widest uppercase text-neutral-600">
                Project Location
              </span>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City, State"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[9px] tracking-widest uppercase text-neutral-600">
                Estimated Budget
              </span>
              <select
                name="budget"
                value={form.budget}
                onChange={handleChange}
                className={inputClass + " bg-transparent"}
              >
                <option value="" className="bg-[#0a0a0a]">Select a range</option>
                <option className="bg-[#0a0a0a]">Under ₹25 Lakh</option>
                <option className="bg-[#0a0a0a]">₹25L – ₹50L</option>
                <option className="bg-[#0a0a0a]">₹50L – ₹1 Crore</option>
                <option className="bg-[#0a0a0a]">₹1Cr – ₹5 Crore</option>
                <option className="bg-[#0a0a0a]">Above ₹5 Crore</option>
              </select>
            </label>
          </div>

          {/* Row 4 — Message */}
          <label className="flex flex-col gap-2">
            <span className="text-[9px] tracking-widest uppercase text-neutral-600">
              Message *
            </span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Tell us about your project…"
              className={inputClass + " resize-none"}
            />
          </label>

          {/* Error message */}
          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="self-start text-[10px] tracking-[0.4em] uppercase border
              border-white/22 px-10 py-4 hover:bg-white hover:text-[#0a0a0a]
              transition-all duration-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Sending…" : "Send Enquiry →"}
          </button>
        </form>

      </div>
    </main>
  );
}

export default Contact;