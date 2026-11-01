#!/usr/bin/env node
// Runs the native (Go) TypeScript compiler. `typescript` itself stays on 6.x
// because typescript-eslint needs its JS API (peer range <6.1). Once it
// supports 7.x, bump `typescript` and drop this shim.
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const manifest = createRequire(import.meta.url).resolve(
  "typescript-native/package.json",
);

await import(
  pathToFileURL(path.join(path.dirname(manifest), "bin", "tsc")).href
);
