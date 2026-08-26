import { Link } from "react-router-dom";

function Footer() {
  const navLinks = [
    { to: "/",         label: "Home"     },
    { to: "/projects", label: "Projects" },
    { to: "/about",    label: "About"    },
    { to: "/contact",  label: "Contact"  },
  ];

  return (
    <footer className="border-t border-white/5 px-6 lg:px-12 pt-16 pb-10">

      {/* ── Top Grid ── */}
      <div className="grid md:grid-cols-3 gap-14 mb-16">

        {/* Brand */}
        <div>
          <p
            style={{ fontFamily: "var(--font-display)" }}
            className="text-2xl font-light mb-4 leading-snug"
          >
            Shivakriti<br />Constructions
          </p>
          <p className="text-xs text-neutral-600 leading-relaxed max-w-xs">
            Building premium spaces across Rajasthan with craftsmanship, integrity, and vision.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <p className="text-[9px] tracking-[0.4em] uppercase text-neutral-600 mb-6">
            Navigation
          </p>
          <nav className="flex flex-col gap-3">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-xs text-neutral-500 hover:text-white transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact Info */}
        {/* NOTE: Replace with actual contact details */}
        <div>
          <p className="text-[9px] tracking-[0.4em] uppercase text-neutral-600 mb-6">
            Get In Touch
          </p>
          <div className="flex flex-col gap-3 text-xs text-neutral-500">
            <p>contact@shivakriti.com</p>
            <p>+91 00000 00000</p>
            <p>Jaipur, Rajasthan</p>
          </div>
          <Link
            to="/contact"
            className="mt-8 inline-block text-[9px] tracking-[0.3em] uppercase border
              border-white/15 px-5 py-2.5 text-neutral-400 hover:border-white/40
              hover:text-white transition-all duration-300"
          >
            Send Enquiry →
          </Link>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between
        gap-3 pt-8 border-t border-white/5">
        <p className="text-[9px] text-neutral-700 tracking-[0.3em] uppercase">
          © 2026 Shivakriti Constructions. All rights reserved.
        </p>
        <p className="text-[9px] text-neutral-800 tracking-widest uppercase">
          Construction &amp; Architecture
        </p>
      </div>
    </footer>
  );
}

export default Footer;