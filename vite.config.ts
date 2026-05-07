import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: { host: "0.0.0.0", port: 3000 },
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
            return "vendor-react";
          }
          if (id.includes("@tanstack")) return "vendor-query";
          if (id.includes("@radix-ui")) return "vendor-radix";
          if (id.includes("xlsx")) return "vendor-xlsx";
          if (id.includes("lucide-react") || id.includes("motion")) return "vendor-ui";
          return "vendor";
        },
      },
    },
  },
});
