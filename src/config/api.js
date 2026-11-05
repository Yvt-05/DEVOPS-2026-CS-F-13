// ─────────────────────────────────────────────────────────────────────────────
// api.js — API Configuration for Shivakriti Constructions
//
// In development: defaults to "http://localhost:5000" (or VITE_API_URL if set).
// In production (Vercel): API is served from the same domain via /api/* routes
//   so no VITE_API_URL is needed — requests go to the same origin.
// ─────────────────────────────────────────────────────────────────────────────

const rawUrl = import.meta.env.VITE_API_URL || "";
export const API_BASE_URL = rawUrl.replace(/\/+$/, "");

export const API_ENDPOINTS = {
  enquiries: `${API_BASE_URL}/api/enquiries`,
  projects: `${API_BASE_URL}/api/projects`,
  health: `${API_BASE_URL}/api/health`,
};
