import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

function Navbar() {
  // True when the user has scrolled past 60px — triggers the solid background
  const [scrolled, setScrolled] = useState(false);

  // Controls the mobile full-screen menu
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  // Close the mobile menu whenever the user navigates to a new page
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Listen to scroll events to toggle the scrolled state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scrolling while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { to: "/projects", label: "Projects" },
    { to: "/about",    label: "About"    },
  ];

  const mobileLinks = [
    { to: "/",         label: "Home"     },
    { to: "/projects", label: "Projects" },
    { to: "/about",    label: "About"    },
    { to: "/contact",  label: "Enquire"  },
  ];

  return (
    <>
      {/* ── Main Navigation Bar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between
          px-6 lg:px-12 py-5 transition-all duration-500 ${
            scrolled
              ? "bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5"
              : "bg-transparent"
          }`}
      >
        {/* Company Logo + Name */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-70 transition-opacity duration-300"
        >
          <img
            src="/images/logo/logo.png"
            alt="Shivakriti Constructions"
            className="h-8 w-auto object-contain"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <span
            className="text-xs tracking-[0.22em] uppercase font-light hidden sm:block"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Shivakriti Constructions
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-[10px] tracking-[0.22em] uppercase transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-45 hover:opacity-100"
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {/* Enquiry CTA button */}
          <Link
            to="/contact"
            className="text-[10px] tracking-[0.22em] uppercase border border-white/20 px-5 py-2.5
              hover:bg-white hover:text-[#0a0a0a] transition-all duration-300"
          >
            Enquire
          </Link>
        </div>

        {/* Mobile Hamburger — three animated lines */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden relative z-50 flex flex-col justify-center items-end gap-[5px]
            w-8 h-8 cursor-pointer"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span
            className={`block h-px bg-white transition-all duration-400 ${
              menuOpen ? "w-6 rotate-45 translate-y-[9px]" : "w-6"
            }`}
          />
          <span
            className={`block h-px bg-white transition-all duration-400 ${
              menuOpen ? "opacity-0 w-3" : "w-4"
            }`}
          />
          <span
            className={`block h-px bg-white transition-all duration-400 ${
              menuOpen ? "w-6 -rotate-45 -translate-y-[9px]" : "w-6"
            }`}
          />
        </button>
      </nav>

      {/* ── Mobile Full-Screen Menu Overlay ── */}
      <div
        className={`mobile-overlay fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col
          justify-center px-8 ${menuOpen ? "open" : ""}`}
      >
        <nav className="flex flex-col gap-10">
          {mobileLinks.map(({ to, label }, i) => (
            <Link
              key={to}
              to={to}
              style={{
                fontFamily: "var(--font-display)",
                transitionDelay: menuOpen ? `${i * 0.06}s` : "0s",
              }}
              className="text-6xl font-light text-white/75 hover:text-white transition-colors
                leading-none"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="absolute bottom-12 left-8 text-[9px] tracking-[0.4em] text-neutral-600 uppercase">
          Shivakriti Constructions
        </p>
      </div>
    </>
  );
}

export default Navbar;