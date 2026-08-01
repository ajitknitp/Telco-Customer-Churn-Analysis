import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // During local dev, calls to /api/* are forwarded to the backend.
      // Point this at Flask (5000) or FastAPI (8000) — see README.
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
