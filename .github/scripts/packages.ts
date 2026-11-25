/**
 * ## Release tooling for the public npm packages - SemVer through changesets
 *
 * The product (site, repo) is versioned by `release.ts` with CalVer. The
 * publishable packages (`@nykon/rhumb`, `@nykon/rhumb-cli`, ...) are versioned
 * here with plain SemVer, each on its own, and `@changesets/cli` does the
 * bumping and the changelogs. This file is the glue around it.
 *
 * A package is public when its package.json is not `"private": true`, so a new
 * publishable package is picked up without touching this file.
 *
 * ### Commands:
 *  - `list`:
 *      Print the public packages as JSON: `[{ name, dir, version }]`.
 *  - `check [--base <ref>]` (default `origin/dev`):
 *      The pull request gate. Fails when the pull request changes code that
 *      ends up in a public package (the package itself or any workspace package
 *      bundled into it) without a changeset naming that package.
 *      An empty changeset (`pnpm changeset --empty`) says "no release needed".
 *  - `pending`:
 *      Print as JSON the public packages whose current version has no git tag
 *      `<name>@<version>` yet, i.e. what a release still has to publish:
 *      `[{ name, dir, version, previous }]`. Tags are created only after a
 *      successful npm publish, so "no tag" means "not published". The version
 *      `0.0.0` is the never-released placeholder and is never pending.
 *  - `verify`:
 *      The release-readiness gate. Fails unless every public package has a
 *      valid SemVer; every pending one is newer than its last tag and has a
 *      changelog section; and no changeset is left unconsumed.
 *  - `plan`:
 *      Print the pending packages as a Markdown list (`name old -> new`), or
 *      nothing when there are none.
 *  - `notes <name> [version]`:
 *      Print the changelog section of a package (default: its current version),
 *      for the GitHub Release of that package.
 *
 * See: RELEASING.md
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

export interface Pkg {
  readonly name: string;
  readonly dir: string;
  readonly version: string;
  readonly isPrivate: boolean;
  readonly workspaceDeps: readonly string[];
}

export interface Changeset {
  readonly file: string;
  readonly releases: Readonly<Record<string, string>>;
}

export interface SemVer {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly prerelease: readonly string[];
}

const DEFAULT_BASE = "origin/dev";
const UNRELEASED = "0.0.0";
const WORKSPACE_DIRS = ["packages", "apps"];
const CHANGESET_DIR = ".changeset";
const BUMPS = new Set(["major", "minor", "patch"]);
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

/**
 * Workspace packages that only configure the toolchain. They are
 * dependencies of the public packages in the graph but never reach the
 * published files, so changing them does not demand a changeset.
 */
const TOOLING = new Set([
  "@rhumb/tsconfig",
  "@rhumb/eslint-config",
  "@rhumb/eslint-plugin-fsd",
]);

//<editor-fold desc="SemVer" defaultstate="collapsed">

export function parseSemVer(text: string): SemVer | null {
  const match = SEMVER_PATTERN.exec(text);

  if (match === null) {
    return null;
  }

  const [, major = "", minor = "", patch = "", prerelease = ""] = match;

  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    prerelease: prerelease === "" ? [] : prerelease.split("."),
  };
}

function comparePrerelease(a: readonly string[], b: readonly string[]): number {
  // A version without a prerelease part is higher than one with it.
  if (a.length === 0 || b.length === 0) {
    return b.length - a.length;
  }

  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const left = a[index];
    const right = b[index];

    if (left === undefined) {
      return -1;
    }

    if (right === undefined) {
      return 1;
    }

    if (left === right) {
      continue;
    }

    const leftNumeric = /^\d+$/.test(left);
    const rightNumeric = /^\d+$/.test(right);

    if (leftNumeric && rightNumeric) {
      return Number(left) - Number(right);
    }

    if (leftNumeric !== rightNumeric) {
      return leftNumeric ? -1 : 1;
    }

    return left < right ? -1 : 1;
  }

  return 0;
}

export function compareSemVer(a: SemVer, b: SemVer): number {
  return (
    a.major - b.major ||
    a.minor - b.minor ||
    a.patch - b.patch ||
    comparePrerelease(a.prerelease, b.prerelease)
  );
}

//</editor-fold>
//<editor-fold desc="Workspace" defaultstate="collapsed">

function git(...args: string[]): string {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
}

interface RawManifest {
  name?: string;
  version?: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

function parseManifest(json: string, source: string): RawManifest {
  const data: unknown = JSON.parse(json);

  if (typeof data !== "object" || data === null) {
    throw new Error(`${source} is not a JSON object.`);
  }

  return data;
}

/** Reads every workspace package under `packages/` and `apps/`. */
export function readPackages(root = "."): Map<string, Pkg> {
  const raw: { dir: string; manifest: RawManifest }[] = [];

  for (const workspace of WORKSPACE_DIRS) {
    if (!existsSync(join(root, workspace))) {
      continue;
    }

    for (const entry of readdirSync(join(root, workspace)).sort()) {
      const path = join(root, workspace, entry, "package.json");

      if (existsSync(path)) {
        raw.push({
          dir: `${workspace}/${entry}`,
          manifest: parseManifest(readFileSync(path, "utf8"), path),
        });
      }
    }
  }

  const names = new Set(raw.flatMap(({ manifest }) => manifest.name ?? []));
  const packages = new Map<string, Pkg>();

  for (const { dir, manifest } of raw) {
    if (manifest.name === undefined) {
      continue;
    }

    packages.set(manifest.name, {
      name: manifest.name,
      dir,
      version: manifest.version ?? "0.0.0",
      isPrivate: manifest.private === true,
      workspaceDeps: Object.keys({
        ...manifest.dependencies,
        ...manifest.devDependencies,
        ...manifest.peerDependencies,
        ...manifest.optionalDependencies,
      }).filter((name) => names.has(name)),
    });
  }

  return packages;
}

export function publicPackages(packages: ReadonlyMap<string, Pkg>): Pkg[] {
  return [...packages.values()].filter(({ isPrivate }) => !isPrivate);
}

/** Directories a public package is built from: itself and what it bundles. */
export function sourceDirectories(
  name: string,
  packages: ReadonlyMap<string, Pkg>,
): string[] {
  const seen = new Set<string>();
  const queue = [name];

  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    const pkg = packages.get(next);

    if (pkg === undefined || seen.has(next) || TOOLING.has(next)) {
      continue;
    }

    seen.add(next);
    queue.push(...pkg.workspaceDeps);
  }

  return [...seen].flatMap((seenName) => packages.get(seenName)?.dir ?? []);
}

//</editor-fold>
//<editor-fold desc="Changesets" defaultstate="collapsed">

/** Files that cannot change what a package publishes. */
export function isShipping(file: string): boolean {
  return (
    !file.startsWith(`${CHANGESET_DIR}/`) &&
    !/\.mdx?$/.test(file) &&
    !/\.test\.[cm]?[jt]sx?$/.test(file)
  );
}

export function parseChangeset(file: string, text: string): Changeset {
  const front = /^---[ \t]*\r?\n([\s\S]*?)^---[ \t]*$/m.exec(text);
  const releases: Record<string, string> = {};

  for (const line of (front?.[1] ?? "").split(/\r?\n/)) {
    const entry = /^\s*["']?([^"':]+?)["']?\s*:\s*([a-z]+)\s*$/.exec(line);

    if (entry?.[1] !== undefined && entry[2] !== undefined) {
      releases[entry[1]] = entry[2];
    }
  }

  return { file, releases };
}

/** Public packages that a set of changed files ends up in. */
export function affectedPackages(
  files: readonly string[],
  packages: ReadonlyMap<string, Pkg>,
): string[] {
  const shipping = files.filter(isShipping);

  return publicPackages(packages)
    .filter(({ name }) =>
      sourceDirectories(name, packages).some((dir) =>
        shipping.some((file) => file.startsWith(`${dir}/`)),
      ),
    )
    .map(({ name }) => name);
}

/** The pull request gate. Returns the problems found (empty means fine). */
export function checkChangesets(input: {
  readonly files: readonly string[];
  readonly changesets: readonly Changeset[];
  readonly packages: ReadonlyMap<string, Pkg>;
}): string[] {
  const { files, changesets, packages } = input;
  const problems: string[] = [];
  const publicNames = new Set(publicPackages(packages).map(({ name }) => name));

  for (const { file, releases } of changesets) {
    for (const [name, bump] of Object.entries(releases)) {
      if (!publicNames.has(name)) {
        problems.push(`${file}: "${name}" is not a public package.`);
      }

      if (!BUMPS.has(bump)) {
        problems.push(`${file}: "${bump}" is not major, minor or patch.`);
      }
    }
  }

  const affected = affectedPackages(files, packages);

  if (affected.length === 0) {
    return problems;
  }

  const list = affected.join(", ");

  if (changesets.length === 0) {
    problems.push(
      `This pull request changes code that ships in ${list}, but adds no ` +
        "changeset. Run `pnpm changeset` (or `pnpm changeset --empty` when " +
        "no release is needed).",
    );

    return problems;
  }

  if (changesets.some(({ releases }) => Object.keys(releases).length === 0)) {
    return problems;
  }

  const named = new Set(changesets.flatMap(({ releases }) => Object.keys(releases)));
  const missing = affected.filter((name) => !named.has(name));

  if (missing.length > 0) {
    problems.push(
      `The changes ship in ${list}, but no changeset names ${missing.join(", ")}. ` +
        "A package that bundles a changed package needs its own entry (at least patch).",
    );
  }

  return problems;
}

function readChangesets(root: string): Changeset[] {
  const directory = join(root, CHANGESET_DIR);

  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory)
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .sort()
    .map((file) =>
      parseChangeset(
        `${CHANGESET_DIR}/${file}`,
        readFileSync(join(directory, file), "utf8"),
      ),
    );
}

//</editor-fold>
//<editor-fold desc="Changelog" defaultstate="collapsed">

/** The body of the `## <version>` section of a changesets CHANGELOG.md. */
export function changelogSection(
  changelog: string,
  version: string,
): string | null {
  const lines = changelog.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);

  if (start === -1) {
    return null;
  }

  const next = lines.findIndex(
    (line, index) => index > start && line.startsWith("## "),
  );

  return lines
    .slice(start + 1, next === -1 ? lines.length : next)
    .join("\n")
    .trim();
}

//</editor-fold>
//<editor-fold desc="Commands" defaultstate="collapsed">

export interface Pending {
  readonly pkg: Pkg;
  /** The newest released version of the package, if there is one. */
  readonly previous: string | null;
}

/** The highest version among the `<name>@<version>` tags of a package. */
export function latestTagVersion(
  name: string,
  tags: readonly string[],
): string | null {
  let best: { text: string; version: SemVer } | null = null;

  for (const tag of tags) {
    if (!tag.startsWith(`${name}@`)) {
      continue;
    }

    const text = tag.slice(name.length + 1);
    const version = parseSemVer(text);

    if (version !== null && (best === null || compareSemVer(version, best.version) > 0)) {
      best = { text, version };
    }
  }

  return best?.text ?? null;
}

/** Public packages whose current version has not been released (tagged). */
export function pendingPackages(
  packages: readonly Pkg[],
  tags: readonly string[],
): Pending[] {
  return packages
    .filter(
      ({ name, version }) =>
        version !== UNRELEASED && !tags.includes(`${name}@${version}`),
    )
    .map((pkg) => ({ pkg, previous: latestTagVersion(pkg.name, tags) }));
}

function listTags(): string[] {
  return git("tag", "--list")
    .split("\n")
    .filter((tag) => tag !== "");
}

/**
 * What is wrong with the version of one public package, given the tags that
 * exist and the text of its CHANGELOG.md. Empty means fine.
 */
export function versionProblems(
  pkg: Pkg,
  tags: readonly string[],
  changelog: string,
): string[] {
  const current = parseSemVer(pkg.version);

  if (current === null) {
    return [`${pkg.name}: "${pkg.version}" is not a valid SemVer.`];
  }

  const problems: string[] = [];
  const latest = latestTagVersion(pkg.name, tags);
  const last = latest === null ? null : parseSemVer(latest);

  if (last !== null && compareSemVer(current, last) < 0) {
    problems.push(
      `${pkg.name}: ${pkg.version} is older than the released ${String(latest)}.`,
    );
  }

  const [pending] = pendingPackages([pkg], tags);

  if (pending !== undefined) {
    if (last !== null && compareSemVer(current, last) === 0) {
      problems.push(`${pkg.name}: ${pkg.version} is already released.`);
    }

    if (changelogSection(changelog, pkg.version) === null) {
      problems.push(
        `${pkg.name}: ${pkg.dir}/CHANGELOG.md has no "## ${pkg.version}" section.`,
      );
    }
  }

  return problems;
}

/** The release-readiness gate for the packages. */
export function verifyPackages(tags: readonly string[], root = "."): string[] {
  const problems = publicPackages(readPackages(root)).flatMap((pkg) => {
    const path = join(root, pkg.dir, "CHANGELOG.md");

    return versionProblems(
      pkg,
      tags,
      existsSync(path) ? readFileSync(path, "utf8") : "",
    );
  });

  for (const { file, releases } of readChangesets(root)) {
    if (Object.keys(releases).length > 0) {
      problems.push(`${file} was not consumed by \`changeset version\`.`);
    }
  }

  return problems;
}

export function planRows(pending: readonly Pending[]): string[] {
  return pending.map(
    ({ pkg, previous }) =>
      `- \`${pkg.name}\` ${previous ?? "(new)"} → **${pkg.version}**`,
  );
}

function fail(problems: readonly string[]): never {
  throw new Error(problems.join("\n"));
}

function run(
  command: string,
  args: readonly string[],
  options: { base: string },
): string {
  const root = ".";

  switch (command) {
    case "list": {
      return JSON.stringify(
        publicPackages(readPackages(root)).map(({ name, dir, version }) => ({
          name,
          dir,
          version,
        })),
      );
    }

    case "check": {
      const files = git("diff", "--name-only", `${options.base}...HEAD`)
        .split("\n")
        .filter((file) => file !== "");
      const added = new Set(
        git(
          "diff",
          "--name-only",
          "--diff-filter=A",
          `${options.base}...HEAD`,
          "--",
          CHANGESET_DIR,
        )
          .split("\n")
          .filter((file) => file !== ""),
      );
      const changesets = readChangesets(root).filter(({ file }) =>
        added.has(file),
      );
      const problems = checkChangesets({
        files,
        changesets,
        packages: readPackages(root),
      });

      return problems.length > 0 ? fail(problems) : "Changesets are in order.";
    }

    case "pending": {
      return JSON.stringify(
        pendingPackages(publicPackages(readPackages(root)), listTags()).map(
          ({ pkg, previous }) => ({
            name: pkg.name,
            dir: pkg.dir,
            version: pkg.version,
            previous,
          }),
        ),
      );
    }

    case "verify": {
      const problems = verifyPackages(listTags(), root);

      return problems.length > 0 ? fail(problems) : "Packages are ready.";
    }

    case "plan": {
      return planRows(
        pendingPackages(publicPackages(readPackages(root)), listTags()),
      ).join("\n");
    }

    case "notes": {
      const [name, requested] = args;
      const pkg = name === undefined ? undefined : readPackages(root).get(name);

      if (pkg === undefined || pkg.isPrivate) {
        throw new Error(`"${String(name)}" is not a public package.`);
      }

      const version = requested ?? pkg.version;
      const path = join(root, pkg.dir, "CHANGELOG.md");
      const section = existsSync(path)
        ? changelogSection(readFileSync(path, "utf8"), version)
        : null;

      if (section === null) {
        throw new Error(`${pkg.dir}/CHANGELOG.md has no "## ${version}" section.`);
      }

      return section;
    }

    default:
      throw new Error(`Unknown command "${command}".`);
  }
}

//</editor-fold>

function main(): void {
  try {
    const { positionals, values } = parseArgs({
      args: process.argv.slice(2),
      allowPositionals: true,
      options: {
        base: { type: "string", default: DEFAULT_BASE },
      },
    });

    const [command, ...args] = positionals;

    if (command === undefined) {
      throw new Error(
        "Usage: node .github/scripts/packages.ts <list|check|pending|verify|plan|notes> [options]",
      );
    }

    const output = run(command, args, { base: values.base });

    if (output !== "") {
      console.log(output);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (process.env.GITHUB_ACTIONS === "true") {
      console.error(`::error::${message.replace(/\r?\n/g, " ")}`);
    } else {
      console.error(`error: ${message}`);
    }

    process.exitCode = 1;
  }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
