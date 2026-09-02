import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

function guideReleaseMarker() {
  return {
    name: "guide-release-marker",
    generateBundle() {
      const commit = process.env.RENDER_GIT_COMMIT || process.env.GITHUB_SHA || "local";
      const branch = process.env.RENDER_GIT_BRANCH || process.env.GITHUB_REF_NAME || "local";
      const generatedAt = new Date().toISOString();

      this.emitFile({
        type: "asset",
        fileName: "guide/release.json",
        source: `${JSON.stringify({ product: "moodle-guide", commit, branch, generatedAt }, null, 2)}\n`,
      });
    },
  };
}

export default defineConfig({
  server: { host: "0.0.0.0", port: 3000 },
  plugins: [react(), guideReleaseMarker()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-accordion", "@radix-ui/react-tabs", "lucide-react"],
          supabase: ["@supabase/supabase-js"],
          xlsx: ["xlsx"],
        }
      }
    },
    chunkSizeWarningLimit: 1200,
  },
});