import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Raise the warning limit since Three.js is intentionally large
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split Three.js into its own chunk — cached separately by the browser
        manualChunks: {
          three: ["three"],
        },
      },
    },
  },
});