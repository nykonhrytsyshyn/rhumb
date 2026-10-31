import { readdirSync } from "node:fs";
import path from "node:path";

import { type Layer, RESOLVABLE_INDEX_FILES } from "./layers";

const CACHE_TTL_MS = 3000;

interface CacheEntry {
  readonly value: boolean;
  readonly expires: number;
}

const cache = new Map<string, CacheEntry>();

function directoryHasIndex(directory: string): boolean {
  try {
    const names = readdirSync(directory);

    return RESOLVABLE_INDEX_FILES.some((file) => names.includes(file));
  } catch {
    return false;
  }
}

export function hasPublicDirectoryIndex(
  importPath: string,
  filename: string,
  layer: Layer,
): boolean {
  const normalized = filename.includes("\\")
    ? filename.replace(/\\/g, "/")
    : filename;
  const srcIndex = normalized.lastIndexOf("/src/");

  if (srcIndex === -1) {
    return false;
  }

  const projectRoot = normalized.slice(0, srcIndex);
  const key = `${projectRoot}\0${importPath}`;
  const now = Date.now();
  const hit = cache.get(key);

  if (hit && hit.expires > now) {
    return hit.value;
  }

  const prefix = `@${layer}/`;
  const value = importPath.startsWith(prefix)
    ? directoryHasIndex(
        path.join(projectRoot, "src", layer, importPath.slice(prefix.length)),
      )
    : false;

  cache.set(key, { value, expires: now + CACHE_TTL_MS });

  return value;
}
