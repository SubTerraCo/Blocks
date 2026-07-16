import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main process entry
        entry: "src/main/index.ts",
        vite: {
          build: {
            outDir: "dist/main",
            rollupOptions: {
              external: ["electron"],
            },
          },
        },
      },
      {
        // Preload script entry
        entry: "src/preload/index.ts",
        vite: {
          build: {
            outDir: "dist/preload",
            rollupOptions: {
              external: ["electron"],
            },
          },
        },
        onstart(options) {
          options.reload();
        },
      },
    ]),
    // vite-plugin-electron-renderer removed: no renderer code imports node
    // built-ins, and with Vite 8 its dev CJS proxy breaks React (null
    // dispatcher crash on every hook call under `vite` dev / Playwright e2e).
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Workspace-linked @blocks/ui resolves its own pnpm peer-keyed copies of
    // these in dev, creating a second React instance (null-dispatcher crash).
    dedupe: ["react", "react-dom", "zustand"],
  },
  build: {
    outDir: "dist/renderer",
    emptyOutDir: true,
  },
});

