import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { type Plugin, build, createServer } from "vite";

import type { AgentKitFile, AgentKitInput } from "@rhumb/agent-kit";

interface KitModule {
  readonly buildAgentKit: (input: AgentKitInput) => readonly AgentKitFile[];
}

const BASE_PATH = "/agents/";
const KIT_ROOT = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "packages",
  "agent-kit",
);
const CONTENT_DIR = path.join(KIT_ROOT, "content");
const KIT_ENTRY = path.join(KIT_ROOT, "src", "api", "kit", "index.ts");
const VALIDATOR_ENTRY = path.join(KIT_ROOT, "scripts", "validate-cli.ts");

function walk(dir: string): readonly string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(path.join(dir, entry.name))
      : [path.join(dir, entry.name)],
  );
}

/** The texts of the content folder, by path inside it. */
function readSources(): Readonly<Record<string, string>> {
  return Object.fromEntries(
    walk(CONTENT_DIR).map((file) => [
      path.relative(CONTENT_DIR, file).split(path.sep).join("/"),
      readFileSync(file, "utf8").replace(/\r\n/g, "\n"),
    ]),
  );
}

/** Bundles the checker into one file an agent can run with plain Node. */
async function bundleValidator(): Promise<string> {
  const output = await build({
    configFile: false,
    logLevel: "silent",
    build: {
      write: false,
      ssr: VALIDATOR_ENTRY,
      target: "node22",
      minify: false,
      rolldownOptions: {
        output: { format: "es", entryFileNames: "validate.mjs" },
      },
    },
    ssr: { noExternal: true },
  });
  const outputs = Array.isArray(output) ? output : [output];
  const chunk = outputs
    .flatMap((result) => ("output" in result ? result.output : []))
    .find((item) => item.type === "chunk" && item.isEntry);

  if (chunk?.type !== "chunk") {
    throw new Error("The agent kit checker was not bundled");
  }

  return `#!/usr/bin/env node\n${chunk.code}`;
}

function packageVersion(root: string): string {
  const manifest = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf8"),
  ) as { readonly version: string };

  return manifest.version;
}

/**
 * The kit is TypeScript of a workspace package, which Node cannot load by
 * itself, so it is loaded through a short-lived Vite server that transforms it.
 */
async function loadKit(root: string): Promise<KitModule> {
  const server = await createServer({
    configFile: false,
    root,
    logLevel: "silent",
    appType: "custom",
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true },
  });

  try {
    return (await server.ssrLoadModule(KIT_ENTRY)) as KitModule;
  } finally {
    await server.close();
  }
}

async function makeKit(root: string): Promise<readonly AgentKitFile[]> {
  const kit = await loadKit(root);

  return kit.buildAgentKit({
    version: packageVersion(root),
    sources: readSources(),
    validator: await bundleValidator(),
  });
}

/**
 * Serves the skills and prompts for AI agents under `/agents/`: emitted as
 * files by a build, built on demand (and again after an edit of the content)
 * by the dev server. They are made from `packages/agent-kit`, so there is
 * nothing to commit.
 */
export function agentKit(): Plugin {
  let root = process.cwd();
  let cached: Promise<readonly AgentKitFile[]> | undefined;

  return {
    name: "rhumb:agent-kit",

    configResolved(config) {
      root = config.root;
    },

    async buildStart() {
      if (this.environment.mode !== "build") {
        return;
      }

      for (const file of await makeKit(root)) {
        this.emitFile({
          type: "asset",
          fileName: `${BASE_PATH.slice(1)}${file.fileName}`,
          source: file.data,
        });
      }
    },

    configureServer(server) {
      server.watcher.add(CONTENT_DIR);
      server.watcher.on("all", (_event, changed) => {
        if (changed.startsWith(CONTENT_DIR)) {
          cached = undefined;
        }
      });

      server.middlewares.use((request, response, next) => {
        const url = request.url?.split("?")[0] ?? "";

        if (!url.startsWith(BASE_PATH)) {
          next();

          return;
        }

        cached ??= makeKit(root);
        cached
          .then((files) => {
            const file = files.find(
              (candidate) => `${BASE_PATH}${candidate.fileName}` === url,
            );

            if (file === undefined) {
              next();

              return;
            }

            response.setHeader("Content-Type", file.mime);
            response.setHeader("Cache-Control", "no-store");
            response.end(file.data);
          })
          .catch((error: unknown) => {
            cached = undefined;
            next(error);
          });
      });
    },
  };
}
