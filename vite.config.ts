import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: { host: "0.0.0.0", port: 3000 },
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    // Keep Vite/Rollup default chunking. Manual vendor splitting caused a circular
    // runtime chunk in the Moodle iframe build, so stability is preferred here.
    chunkSizeWarningLimit: 1200,
  },
});
