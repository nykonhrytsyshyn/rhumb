import { copyFileSync } from "node:fs";
import path from "node:path";

import { type Plugin, type ResolvedConfig } from "vite";

/**
 * Static hosts answer an unknown URL with `/404.html` and a real 404 status.
 * The app shell is served there, so the client can draw its own not-found page
 * and search engines still see the right status.
 */
export function notFoundShell(): Plugin {
  let outDir = "";

  return {
    name: "rhumb:not-found-shell",
    apply: "build",
    configResolved(config: ResolvedConfig) {
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
