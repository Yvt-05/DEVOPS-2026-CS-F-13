// ─────────────────────────────────────────────────────────────────────────────
// api.js — API Configuration for Shivakriti Constructions
//
// In development: defaults to "http://localhost:5000" (or VITE_API_URL if set).
// In production (Vercel): set VITE_API_URL to your Render backend URL,
// e.g., "https://shivakriti-backend.onrender.com".
// ─────────────────────────────────────────────────────────────────────────────

const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_BASE_URL = rawUrl.replace(/\/+$/, "");

export const API_ENDPOINTS = {
  enquiries: `${API_BASE_URL}/api/enquiries`,
  projects: `${API_BASE_URL}/api/projects`,
  health: `${API_BASE_URL}/health`,
};
