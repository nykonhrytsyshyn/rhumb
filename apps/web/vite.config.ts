import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

const LAYERS = [
  "app",
  "pages",
  "widgets",
  "features",
  "entities",
  "shared",
] as const;

/**
 * Vite configuration.
 *
 * @see {@link https://vitejs.dev/config Vite documentation}
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeManifestIcons: false,
      manifest: {
        name: "Rhumb - Flowcharts by standard",
        short_name: "Rhumb",
        description:
          "Draw flowcharts from Mermaid-like text in the style required by standards.",
        categories: ["productivity", "developer", "utilities", "design"],
        start_url: "/",
        scope: "/",
        id: "/",
        background_color: "#09090b",
        theme_color: "#09090b",
        display: "standalone",
        display_override: [
          "standalone",
          "minimal-ui",
          "window-controls-overlay",
        ],
        orientation: "any",
        icons: [
          {
            src: "/assets/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/assets/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ],

  resolve: {
    alias: Object.fromEntries(
      LAYERS.map((layer) => [
        `@${layer}`,
        path.resolve(import.meta.dirname, "src", layer),
      ]),
    ),
  },

  build: {
    target: "es2024",

    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            },
            { name: "base-ui", test: /node_modules[\\/]@base-ui[\\/]/ },
            {
              name: "codemirror",
              test: /node_modules[\\/](@codemirror|@lezer|@uiw|codemirror|style-mod|w3c-keyname|crelt)[\\/]/,
            },
            { name: "vendor", test: /node_modules/ },
          ],
        },
      },
    },
  },

  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/shared/lib/testing/setup.ts"],
  },
});
