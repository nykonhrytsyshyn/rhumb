/**
 * ## Release tooling for Rhumb - CalVer (`YY.M.N`)
 *
 *  - `YY` - last two digits of the year   (2026 -> 26)
 *  - `M`  - month, WITHOUT a leading zero (1..12)
 *  - `N`  - build number inside that year + month, starting at 1
 *
 * ### Examples:
 *  - `26.9.1` : first  build of September 2026
 *  - `26.9.2` : second build of September 2026
 *  - `26.10.1`: first  build of October   2026
 *
 * ### Commands:
 *  - `next [--base <ref>] [--date <YYYY-MM-DD>]`:
 *      Print the next version (without the `v` prefix).
 *  - `current`:
 *      Print the version of the workspace; fails unless every manifest agrees
 *      on one valid calendar version.
 *  - `bump <version>`:
 *      Write <version> into the root and every workspace package.json.
 *  - `verify [--base <ref>] [--date <YYYY-MM-DD>]`:
 *      Fail unless every manifest carries exactly the version `next` would
 *      produce right now. This is the release-readiness gate.
 *  - `previous <version>`:
 *      Print the highest released tag (`vYY.M.N`) lower than <version>, or
 *      nothing if there is none.
 *
 * See: RELEASING.md
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync, } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

interface CalVer {
  readonly year: number;
  readonly month: number;
  readonly build: number;
}

interface Manifest {
  readonly path: string;
  readonly version: string;
}

const TAG_PREFIX     = "v";
const DEFAULT_BASE   = "origin/release";
const CALVER_PATTERN = /^([1-9]\d?)\.([1-9]|1[0-2])\.([1-9]\d*)$/;
const DATE_PATTERN   = /^(\d{4})-(\d{2})-(\d{2})$/;

//<editor-fold desc="Calendar Versioning" defaultstate="collapsed">

function parseCalVer(text: string): CalVer | null {
  const match = CALVER_PATTERN.exec(text);

  if (match === null) {
    return null;
  }

  const [, year, month, build] = match;

  if (year === undefined || month === undefined || build === undefined) {
    return null;
  }

  return { year: Number(year), month: Number(month), build: Number(build) };
}

function formatCalVer(version: CalVer): string {
  return `${String(version.year)}.${String(version.month)}.${String(version.build)}`;
}

function compareCalVer(a: CalVer, b: CalVer): number {
  return a.year - b.year || a.month - b.month || a.build - b.build;
}

function periodOf(date: Date): Pick<CalVer, "month" | "year"> {
  const fullYear = date.getUTCFullYear();

  if (fullYear < 2010 || fullYear > 2099) {
    throw new Error(
      `Year ${String(fullYear)} cannot be expressed as a two-digit, non-zero-prefixed YY.`,
    );
  }

  return { year: fullYear % 100, month: date.getUTCMonth() + 1 };
}

function nextCalVer(latest: CalVer | null, today: Date): CalVer {
  const period = periodOf(today);

  if (latest === null) {
    return { ...period, build: 1 };
  }

  const order =
    latest.year - period.year || latest.month - period.month;

  if (order > 0) {
    throw new Error(
      `The latest version ${formatCalVer(latest)} is newer than the current UTC month ` +
        `(${String(period.year)}.${String(period.month)}). Check the clock and the existing tags.`,
    );
  }

  return { ...period, build: order === 0 ? latest.build + 1 : 1 };
}

//</editor-fold>

//<editor-fold desc="Git" defaultstate="collapsed">

function git(...args: string[]): string {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function releasedVersions(): CalVer[] {
  return git("tag", "--list", `${TAG_PREFIX}*`)
    .split("\n")
    .flatMap((tag) => {
      const version = tag.startsWith(TAG_PREFIX)
        ? parseCalVer(tag.slice(TAG_PREFIX.length))
        : null;

      return version === null ? [] : [version];
    });
}

function parseManifestVersion(json: string, source: string): string {
  const data: unknown = JSON.parse(json);

  if (
    typeof data !== "object" ||
    data === null ||
    !("version" in data) ||
    typeof data.version !== "string"
  ) {
    throw new Error(`${source} has no string "version" field.`);
  }

  return data.version;
}

function latestKnownVersion(baseRef: string): CalVer | null {
  const candidates = releasedVersions();
  const baseVersion = parseCalVer(
    parseManifestVersion(
      git("show", `${baseRef}:package.json`),
      `${baseRef}:package.json`,
    ),
  );

  if (baseVersion !== null) {
    candidates.push(baseVersion);
  }

  return (
    candidates.reduce<CalVer | null>(
      (best, version) =>
        best === null || compareCalVer(version, best) > 0 ? version : best,
      null,
    ) ?? null
  );
}

//</editor-fold>

//<editor-fold desc="Manifests" defaultstate="collapsed">

function workspacePatterns(root: string): string[] {
  const patterns: string[] = [];
  let inPackages = false;

  for (const rawLine of readFileSync(
    join(root, "pnpm-workspace.yaml"),
    "utf8",
  ).split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, "").trimEnd();

    if (/^packages\s*:\s*$/.test(line)) {
      inPackages = true;
      continue;
    }

    if (!inPackages) {
      continue;
    }

    const item = /^\s+-\s+["']?([^"']+?)["']?\s*$/.exec(line);

    if (item?.[1] !== undefined) {
      patterns.push(item[1]);
    } else if (/^\S/.test(line)) {
      inPackages = false;
    }
  }

  for (const pattern of patterns) {
    if (!/^[\w.-]+(\/[\w.-]+)*(\/\*)?$/.test(pattern)) {
      throw new Error(
        `Unsupported pattern "${pattern}" in pnpm-workspace.yaml - ` +
          "release.ts understands only `dir` and `dir/*`.",
      );
    }
  }

  return patterns;
}

function manifestPaths(root: string): string[] {
  const paths = ["package.json"];

  for (const pattern of workspacePatterns(root)) {
    if (pattern.endsWith("/*")) {
      const parent = pattern.slice(0, -2);
      const children = readdirSync(join(root, parent), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();

      for (const child of children) {
        const path = `${parent}/${child}/package.json`;

        if (existsSync(join(root, path))) {
          paths.push(path);
        }
      }

    } else if (existsSync(join(root, pattern, "package.json"))) {
      paths.push(`${pattern}/package.json`);
    }
  }

  return paths;
}

function readManifests(root: string): Manifest[] {
  return manifestPaths(root).map((path) => ({
    path,
    version: parseManifestVersion(readFileSync(join(root, path), "utf8"), path),
  }));
}

function writeManifestVersion(
  root: string,
  path: string,
  version: string,
): void {
  const file = join(root, path);
  const text = readFileSync(file, "utf8");
  const pattern = /^( {2}"version": ")[^"\n]*(")/m;

  if (!pattern.test(text)) {
    throw new Error(`${path}: no top-level "version" line found.`);
  }

  writeFileSync(
    file,
    text.replace(pattern, (_match, open: string, close: string) =>
      `${open}${version}${close}`,
    ),
  );

  const written = parseManifestVersion(readFileSync(file, "utf8"), path);

  if (written !== version) {
    throw new Error(`${path}: expected ${version} after writing, found ${written}.`);
  }
}

//</editor-fold>

//<editor-fold desc="Commands" defaultstate="collapsed">

function parseToday(date: string | undefined): Date {
  if (date === undefined) {
    return new Date();
  }

  const match = DATE_PATTERN.exec(date);
  const parsed = new Date(`${date}T00:00:00Z`);

  if (match === null || Number.isNaN(parsed.getTime())) {
    throw new Error(`--date must be YYYY-MM-DD (UTC), got "${date}".`);
  }

  return parsed;
}

function requireCalVer(text: string, what: string): CalVer {
  const version = parseCalVer(text);

  if (version === null) {
    throw new Error(
      `${what} "${text}" is not a calendar version (YY.M.N, e.g. 26.10.5).`,
    );
  }

  return version;
}

function agreedVersion(manifests: readonly Manifest[]): string {
  const [first] = manifests;

  if (first === undefined) {
    throw new Error("No package.json files found.");
  }

  const strays = manifests.filter(({ version }) => version !== first.version);

  if (strays.length > 0) {
    throw new Error(
      `Manifests disagree on the version (root is ${first.version}): ` +
        strays.map(({ path, version }) => `${path} is ${version}`).join(", "),
    );
  }

  requireCalVer(first.version, `${first.path} version`);

  return first.version;
}

function run(command: string, args: readonly string[], options: {
  base: string;
  date: string | undefined;
}): string {
  const root = process.cwd();

  switch (command) {
    case "next": {
      return formatCalVer(
        nextCalVer(
          latestKnownVersion(options.base),
          parseToday(options.date),
        )
      );
    }

    case "current":
      return agreedVersion(readManifests(root));

    case "bump": {
      const [version] = args;

      if (version === undefined) {
        throw new Error("Usage: bump <version>");
      }

      requireCalVer(version, "Version");

      for (const { path } of readManifests(root)) {
        writeManifestVersion(root, path, version);
      }

      return version;
    }

    case "verify": {
      const actual = agreedVersion(readManifests(root));
      const latest = latestKnownVersion(options.base);
      const expected = formatCalVer(
        nextCalVer(latest, parseToday(options.date)),
      );

      if (actual !== expected) {
        throw new Error(
          `The version in this tree is ${actual}, but the next release must be ${expected} ` +
          `(latest known: ${latest === null ? "none" : formatCalVer(latest)}). ` +
          "A new month or a new tag changes the expected version - " +
          'run the "Releasing: Release PR" workflow to rebuild the release pull request.',
        );
      }

      return actual;
    }

    case "previous": {
      const [version] = args;

      if (version === undefined) {
        throw new Error("Usage: previous <version>");
      }

      const target = requireCalVer(version, "Version");
      const lower = releasedVersions()
        .filter((candidate) => compareCalVer(candidate, target) < 0)
        .sort(compareCalVer)
        .at(-1);

      return lower === undefined ? "" : `${TAG_PREFIX}${formatCalVer(lower)}`;
    }

    default:
      throw new Error(
        `Unknown command "${command}". Expected: next, current, bump, verify, previous.`,
      );
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
        date: { type: "string" },
      },
    });

    const [command, ...args] = positionals;

    if (command === undefined) {
      throw new Error(
        "Usage: node .github/scripts/release.ts <next|current|bump|verify|previous> [options]",
      );
    }

    const output = run(command, args, {
      base: values.base,
      date: values.date,
    });

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

main();
