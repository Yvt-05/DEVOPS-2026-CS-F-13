import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

/*
  EngagementPrompt
  ────────────────
  Shows a tasteful, non-intrusive enquiry prompt when a visitor has shown
  genuine interest in the website. This is determined by three signals:

    1. Time on site > 45 seconds
    2. At least 2 different pages visited
    3. Scrolled at least 60% down on any page

  Rules:
  - Only shown once per session (stored in sessionStorage)
  - Never shown on the /contact page
  - Dismissed by clicking X or the enquiry button
  - Does NOT forcibly redirect or pop over the screen repeatedly
*/
function EngagementPrompt() {
  const [visible, setVisible]   = useState(false);
  const location                = useLocation();
  const pagesVisited            = useRef(new Set());
  const scrolledEnough          = useRef(false);
  const timeRef                 = useRef(null);

  // Track unique pages visited in this session
  useEffect(() => {
    pagesVisited.current.add(location.pathname);
  }, [location.pathname]);

  // Track scroll depth — flag true once user scrolls past 60%
  useEffect(() => {
    function onScroll() {
      const scrolled   = window.scrollY + window.innerHeight;
      const total      = document.body.scrollHeight;
      if (scrolled / total >= 0.6) {
        scrolledEnough.current = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check engagement conditions every second
  useEffect(() => {
    // Don't show if already shown this session or currently on contact page
    if (sessionStorage.getItem("engagementShown") || location.pathname === "/contact") return;

    const startTime = Date.now();

    const interval = setInterval(() => {
      const secondsOnSite = (Date.now() - startTime) / 1000;
      const pagesCount    = pagesVisited.current.size;

      const timeOk   = secondsOnSite >= 45;
      const pagesOk  = pagesCount >= 2;
      const scrollOk = scrolledEnough.current;

      if (timeOk && pagesOk && scrollOk) {
        clearInterval(interval);
        setVisible(true);
        sessionStorage.setItem("engagementShown", "true");
      }
    }, 1000);

    timeRef.current = interval;
    return () => clearInterval(interval);
  }, [location.pathname]);

  function dismiss() {
    setVisible(false);
  }

  if (!visible) return null;

  return (
    // Overlay — fixed to bottom-right, does NOT block the full screen
    <div
      role="dialog"
      aria-label="Project enquiry prompt"
      className="fixed bottom-8 right-6 z-50 w-80 bg-[#111] border border-white/10
        shadow-2xl p-8 animate-[slideInRight_0.5s_ease]"
      style={{ animation: "slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      {/* Close button */}
      <button
        onClick={dismiss}
        aria-label="Close"
        className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors
          text-xs tracking-widest"
      >
        ✕
      </button>

      {/* Content */}
      <p className="text-[9px] tracking-[0.4em] uppercase text-[#b8956a] mb-4">
        Planning a Project?
      </p>
      <p
        style={{ fontFamily: "var(--font-display)" }}
        className="text-2xl font-light leading-snug mb-3"
      >
        Let's talk about what you want to build.
      </p>
      <p className="text-xs text-neutral-500 leading-relaxed mb-8">
        Tell us your vision and we'll get back to you within 24 hours.
      </p>

      <Link
        to="/contact"
        onClick={dismiss}
        className="block text-center text-[10px] tracking-[0.3em] uppercase border
          border-white/20 px-6 py-3 hover:bg-white hover:text-[#0a0a0a] transition-all
          duration-300"
      >
        Start an Enquiry →
      </Link>
    </div>
  );
}

export default EngagementPrompt;
