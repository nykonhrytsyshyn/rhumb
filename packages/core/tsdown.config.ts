import { defineConfig } from "tsdown";

/**
 * Tsdown configuration
 *
 * @see {@link https://tsdown.dev Tsdown documentation}
 */
// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  entry: {
    index: "src/index.ts",
    node: "src/node/index.ts",
  },
  platform: "node",
  format: "esm",
  target: "node22",
  tsconfig: "tsconfig.build.json",
  dts: {
    eager: true,
  },
  clean: true,
  deps: {
    alwaysBundle: [/^@rhumb\//],
    neverBundle: [
      "elkjs",
      "zod",
      "@resvg/resvg-js",
      "sharp",
      /^elkjs\//,
      /^node:/,
    ],
  },
});
