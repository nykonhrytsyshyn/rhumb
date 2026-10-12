import { defineConfig } from "vitest/config";

/**
 * Vitest configuration.
 *
 * @see {@link https://vitest.dev/config Vitest documentation}
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },

  test: {
    environment: "node",
    passWithNoTests: true,
    globals: true,
    projects: ["packages/*", "apps/*"],

    reporters:
      process.env.GITHUB_ACTIONS === "true"
        ? ["default", ["html", { singleFile: true }], "github-actions"]
        : ["default", ["html", { singleFile: true }]],

    outputFile: {
      html: ".vitest/index.html",
    },

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary", "json"],
      reportOnFailure: true,
      include: ["{apps/*/,packages/*/}src/**/*.?(c|m)[jt]s?(x)"],
      exclude: ["**/*.{test,spec}.ts", "**/index.ts", "**/types.ts"],
    },
  },
});
