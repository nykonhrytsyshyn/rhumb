/**
 * Tells whether a public package changed since a release, so that npm gets a
 * new version only when there is something new in it.
 *
 *   node .github/scripts/library-changed.ts <since-tag> [package]
 *      Prints "true" or "false". The reasons go to stderr.
 *
 * A package "changed" when it or any workspace package it is built from did
 * (found through the dependency graph, so a new internal package is picked up
 * without touching this file). Changes that cannot reach the published files
 * do not count: tests, and the `version` field of manifests, which every
 * release bumps.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_PACKAGE = "@nykon/rhumb";
const WORKSPACE_DIRS = ["packages", "apps"];

interface Manifest {
  readonly name?: string;
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly devDependencies?: Readonly<Record<string, string>>;
}

function git(...args: string[]): string {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
}

function readManifest(path: string): Manifest {
  return JSON.parse(readFileSync(path, "utf8")) as Manifest;
}

export function libraryDirectories(
  packageName = DEFAULT_PACKAGE,
  root = ".",
): string[] {
  const byName = new Map<string, string>();

  for (const workspace of WORKSPACE_DIRS) {
    if (!existsSync(join(root, workspace))) {
      continue;
    }

    for (const entry of readdirSync(join(root, workspace))) {
      const manifest = join(root, workspace, entry, "package.json");

      if (existsSync(manifest)) {
        const { name } = readManifest(manifest);

        if (name !== undefined) {
          byName.set(name, `${workspace}/${entry}`);
        }
      }
    }
  }

  const seen = new Set<string>();
  const queue = [packageName];

  for (let name = queue.shift(); name !== undefined; name = queue.shift()) {
    const directory = byName.get(name);

    if (directory === undefined || seen.has(name)) {
      continue;
    }

    seen.add(name);

    const manifest = readManifest(join(root, directory, "package.json"));

    queue.push(
      ...Object.keys({
        ...manifest.dependencies,
        ...manifest.devDependencies,
      }),
    );
  }

  return [...seen].flatMap((name) => byName.get(name) ?? []);
}

function withoutVersion(json: string): string {
  const { version: _version, ...rest } = JSON.parse(json) as {
    version?: string;
  };

  return JSON.stringify(rest);
}

function matters(file: string, since: string): boolean {
  if (/\.test\.[cm]?[jt]sx?$/.test(file)) {
    return false;
  }

  if (!file.endsWith("/package.json")) {
    return true;
  }

  try {
    return (
      withoutVersion(git("show", `${since}:${file}`)) !==
      withoutVersion(readFileSync(file, "utf8"))
    );
  } catch {
    return true;
  }
}

function main(): void {
  const [since, packageName = DEFAULT_PACKAGE] = process.argv.slice(2);

  if (since === undefined) {
    throw new Error("Usage: library-changed.ts <since-tag> [package]");
  }

  try {
    git("rev-parse", "--verify", "--quiet", `${since}^{commit}`);
  } catch {
    console.error(`${since} is not a known tag, so everything counts as new`);
    console.log("true");

    return;
  }

  const files = git(
    "diff",
    "--name-only",
    since,
    "HEAD",
    "--",
    ...libraryDirectories(packageName),
  )
    .split("\n")
    .filter((file) => file !== "");
  const relevant = files.filter((file) => matters(file, since));

  for (const file of relevant) {
    console.error(`changed since ${since}: ${file}`);
  }

  console.log(String(relevant.length > 0));
}

if (import.meta.main) {
  main();
}
