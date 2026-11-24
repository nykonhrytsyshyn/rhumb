import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { defineConfig } from "tsdown";

//<editor-fold desc="Helper functions and constants" defaultstate="collapsed">

const KIT_CONTENT = join(
  import.meta.dirname,
  "..",
  "..",
  "packages",
  "agent-kit",
  "content",
);

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

function agentSources(): Record<string, string> {
  return Object.fromEntries(
    walk(KIT_CONTENT).map((file) => [
      relative(KIT_CONTENT, file).split(sep).join("/"),
      readFileSync(file, "utf8").replace(/\r\n/g, "\n"),
    ]),
  );
}

const { version } = JSON.parse(
  readFileSync(join(import.meta.dirname, "package.json"), "utf8"),
) as { version: string };

//</editor-fold>

/**
 * Tsdown configuration
 *
 * @see {@link https://tsdown.dev Tsdown documentation}
 */
// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  entry: {
    bin: "src/bin.ts",
  },
  platform: "node",
  format: "esm",
  target: "node22",
  dts: false,
  clean: true,
  deps: {
    alwaysBundle: [/^@rhumb\//, /^@nykon\/rhumb/],
    neverBundle: ["elkjs", "zod", "@resvg/resvg-js", "sharp", /^elkjs\//],
  },
  banner: {
    js: "#!/usr/bin/env node",
  },
  define: {
    __AGENT_SOURCES__: JSON.stringify(agentSources()),
    __VERSION__: JSON.stringify(version),
  },
});
