import { useState, useRef, useEffect } from "react";

/*
  BeforeAfterSlider
  ─────────────────
  Accepts two image paths (before / after) and renders a draggable slider
  that reveals the "after" image progressively on top of the "before" image.

  Props:
    before  — image path for the "before" state
    after   — image path for the "after" state
    alt     — accessible alt text
*/
function BeforeAfterSlider({ before, after, alt = "Before and after" }) {
  // sliderPos is a percentage 0–100 representing how much of "after" is revealed
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  // Convert pointer X position to a percentage within the container
  function calcPercent(clientX) {
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.min(100, Math.max(0, (x / rect.width) * 100));
  }

  function handleMouseDown() { setDragging(true); }
  function handleMouseUp()   { setDragging(false); }

  function handleMouseMove(e) {
    if (!dragging) return;
    setSliderPos(calcPercent(e.clientX));
  }

  // Touch support
  function handleTouchMove(e) {
    setSliderPos(calcPercent(e.touches[0].clientX));
  }

  // Release drag if pointer leaves the window
  useEffect(() => {
    const stop = () => setDragging(false);
    window.addEventListener("mouseup", stop);
    return () => window.removeEventListener("mouseup", stop);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      className="relative w-full aspect-[4/3] overflow-hidden select-none cursor-ew-resize
        bg-neutral-900 border border-white/5"
      style={{ touchAction: "none" }}
    >
      {/* Before image — always full width */}
      <img
        src={before}
        alt={`${alt} — before`}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
        draggable={false}
      />

      {/* After image — clipped to reveal only the left portion */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={after}
          alt={`${alt} — after`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${(100 / sliderPos) * 100}%`, maxWidth: "none" }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white/60 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      />

      {/* Drag handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full
          bg-white/90 border border-white/20 flex items-center justify-center shadow-lg
          pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Left/Right arrows */}
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="text-black">
          <path d="M1 5h14M1 5l3-3M1 5l3 3M15 5l-3-3M15 5l-3 3" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 text-[9px] tracking-widest uppercase
        text-white/50 pointer-events-none">
        Before
      </span>
      <span className="absolute top-3 right-3 text-[9px] tracking-widest uppercase
        text-white/50 pointer-events-none">
        After
      </span>
    </div>
  );
}

export default BeforeAfterSlider;
