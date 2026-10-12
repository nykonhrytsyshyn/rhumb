import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
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
  plugins: [react(), tailwindcss()],

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
