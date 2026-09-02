import { execFileSync } from "node:child_process";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

function currentGuideHash() {
  return execFileSync(
    process.execPath,
    [path.resolve(process.cwd(), "scripts/maintenance/guide-content-hash.cjs")],
    { encoding: "utf8" }
  ).trim();
}

function guideReleaseMarker(): Plugin {
  return {
    name: "guide-release-marker",
    generateBundle() {
      const commit = process.env.RENDER_GIT_COMMIT || process.env.GITHUB_SHA || "local";
      const branch = process.env.RENDER_GIT_BRANCH || process.env.GITHUB_REF_NAME || "local";
      const generatedAt = new Date().toISOString();
      const guideHash = currentGuideHash();

      this.emitFile({
        type: "asset",
        fileName: "guide/release.json",
        source: `${JSON.stringify({ product: "moodle-guide", commit, branch, guideHash, generatedAt }, null, 2)}\n`,
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