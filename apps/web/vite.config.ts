import { copyFileSync } from "node:fs";
import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { type Plugin } from "vite";
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
 * Static hosts answer an unknown URL with `/404.html` and a real 404 status.
 * The app shell is served there, so the client can draw its own not-found page
 * and search engines still see the right status.
 */
function notFoundShell(): Plugin {
  let outDir = "";

  return {
    name: "rhumb:not-found-shell",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      copyFileSync(
        path.join(outDir, "index.html"),
        path.join(outDir, "404.html"),
      );
    },
  };
}

/**
 * Vite configuration.
 *
 * @see {@link https://vitejs.dev/config Vite documentation}
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    notFoundShell(),
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
          //<editor-fold desc="Icons" defaultstate="collapsed">
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
            purpose: "any",
          },
          {
            src: "/assets/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          //</editor-fold>
        ],
        screenshots: [
          //<editor-fold desc="Desktop (wide)" defaultstate="collapsed">
          {
            src: "/assets/screenshots/desktop-banner.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
            label: "Rhumb banner",
          },
          {
            src: "/assets/screenshots/desktop-code-tab.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
            label: "Editor tab with code input and diagram output",
          },
          {
            src: "/assets/screenshots/desktop-library-tab.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
            label: "Library tab with saved diagrams and search input",
          },
          {
            src: "/assets/screenshots/desktop-docs-tab.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
            label: "Documentation tab with Markdown content",
          },
          {
            src: "/assets/screenshots/desktop-config-tab.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
            label: "Configuration tab with settings",
          },
          //</editor-fold>
          //<editor-fold desc="Mobile (narrow)" defaultstate="collapsed">
          {
            src: "/assets/screenshots/mobile-banner.png",
            sizes: "1179x2556",
            type: "image/png",
            form_factor: "narrow",
            label: "Rhumb banner",
          },
          {
            src: "/assets/screenshots/mobile-code-tab.png",
            sizes: "1179x2556",
            type: "image/png",
            form_factor: "narrow",
            label: "Editor tab with code input and diagram output",
          },
          {
            src: "/assets/screenshots/mobile-library-tab.png",
            sizes: "1179x2556",
            type: "image/png",
            form_factor: "narrow",
            label: "Library tab with saved diagrams and search input",
          },
          {
            src: "/assets/screenshots/mobile-docs-tab.png",
            sizes: "1179x2556",
            type: "image/png",
            form_factor: "narrow",
            label: "Documentation tab with Markdown content",
          },
          {
            src: "/assets/screenshots/mobile-config-tab.png",
            sizes: "1179x2556",
            type: "image/png",
            form_factor: "narrow",
            label: "Configuration tab with settings",
          },
          //</editor-fold>
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        globIgnores: ["404.html"],
        navigateFallbackDenylist: [
          /^\/robots\.txt$/,
          /^\/sitemap.*\.xml$/,
          /^\/\.well-known\//,
          /^\/manifest\.webmanifest$/,
        ],
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
            { name: "matter", test: /node_modules[\\/]matter-js[\\/]/ },
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
