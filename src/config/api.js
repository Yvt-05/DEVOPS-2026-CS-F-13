// ─────────────────────────────────────────────────────────────────────────────
// api.js — API Configuration for Shivakriti Constructions
//
// In development: defaults to "http://localhost:5000"
// In production (Vercel): uses relative "/api/*" routes to serverless functions
// Can be overridden anytime with VITE_API_URL
// ─────────────────────────────────────────────────────────────────────────────

const isDev = import.meta.env.DEV;
const rawUrl = import.meta.env.VITE_API_URL || (isDev ? "http://localhost:5000" : "");
export const API_BASE_URL = rawUrl.replace(/\/+$/, "");

export const API_ENDPOINTS = {
  enquiries: `${API_BASE_URL}/api/enquiries`,
  projects: `${API_BASE_URL}/api/projects`,
  health: `${API_BASE_URL}/api/health`,
};
