import { describe, expect, it } from "vitest";

import {
  affectedPackages,
  changelogSection,
  checkChangesets,
  compareSemVer,
  latestTagVersion,
  parseChangeset,
  parseSemVer,
  pendingPackages,
  planRows,
  type Pkg,
  type SemVer,
  versionProblems,
} from "./packages";

function pkg(
  name: string,
  dir: string,
  workspaceDeps: string[] = [],
  isPrivate = true,
  version = "0.0.0",
): Pkg {
  return { name, dir, version, isPrivate, workspaceDeps };
}

// core bundles engine (+ tooling); cli bundles core and agent-kit.
const packages = new Map<string, Pkg>(
  [
    pkg("@nykon/rhumb", "packages/core", ["@rhumb/engine", "@rhumb/tsconfig"], false),
    pkg("@nykon/rhumb-cli", "apps/cli", ["@nykon/rhumb", "@rhumb/agent-kit"], false),
    pkg("@rhumb/engine", "packages/engine"),
    pkg("@rhumb/agent-kit", "packages/agent-kit"),
    pkg("@rhumb/tsconfig", "packages/tsconfig"),
    pkg("@rhumb/web", "apps/web", ["@rhumb/engine"]),
  ].map((entry) => [entry.name, entry]),
);

const empty = parseChangeset(".changeset/x.md", "---\n---\n");
const coreMinor = parseChangeset(
  ".changeset/a.md",
  '---\n"@nykon/rhumb": minor\n---\n\nAdd things\n',
);
const both = parseChangeset(
  ".changeset/b.md",
  '---\n"@nykon/rhumb": minor\n"@nykon/rhumb-cli": patch\n---\n\nAdd things\n',
);

function semver(text: string): SemVer {
  const parsed = parseSemVer(text);

  if (parsed === null) {
    throw new Error(`${text} is not a SemVer`);
  }

  return parsed;
}

describe("parseSemVer / compareSemVer", () => {
  it("parses plain and prerelease versions, rejects the rest", () => {
    expect(parseSemVer("1.2.3")).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: [],
    });
    expect(parseSemVer("1.2.3-rc.1")?.prerelease).toEqual(["rc", "1"]);
    expect(parseSemVer("26.11.3")).not.toBeNull();
    expect(parseSemVer("1.2")).toBeNull();
    expect(parseSemVer("01.2.3")).toBeNull();
    expect(parseSemVer("v1.2.3")).toBeNull();
  });

  it("orders versions by SemVer precedence", () => {
    const order = ["0.0.0", "0.1.0", "0.1.1", "1.0.0-rc.1", "1.0.0-rc.2", "1.0.0", "1.10.0"];

    for (let index = 1; index < order.length; index += 1) {
      const lower = semver(order[index - 1] ?? "");
      const higher = semver(order[index] ?? "");

      expect(compareSemVer(lower, higher)).toBeLessThan(0);
      expect(compareSemVer(higher, lower)).toBeGreaterThan(0);
    }
  });
});

describe("parseChangeset", () => {
  it("reads package names and bump types", () => {
    expect(both.releases).toEqual({
      "@nykon/rhumb": "minor",
      "@nykon/rhumb-cli": "patch",
    });
  });

  it("treats a changeset without packages as empty", () => {
    expect(empty.releases).toEqual({});
  });
});

describe("affectedPackages", () => {
  it("follows the bundling graph", () => {
    expect(affectedPackages(["packages/engine/src/a.ts"], packages)).toEqual([
      "@nykon/rhumb",
      "@nykon/rhumb-cli",
    ]);
    expect(affectedPackages(["apps/cli/src/a.ts"], packages)).toEqual([
      "@nykon/rhumb-cli",
    ]);
    expect(affectedPackages(["packages/agent-kit/x.md.ts"], packages)).toEqual([
      "@nykon/rhumb-cli",
    ]);
  });

  it("ignores docs, tests, changesets, tooling and the website", () => {
    expect(
      affectedPackages(
        [
          "packages/core/README.md",
          "packages/engine/src/a.test.ts",
          ".changeset/a.md",
          "packages/tsconfig/base.json",
          "apps/web/src/a.tsx",
          ".github/workflows/x.yaml",
        ],
        packages,
      ),
    ).toEqual([]);
  });
});

describe("checkChangesets", () => {
  const engineChange = ["packages/engine/src/a.ts"];

  it("passes when nothing that ships changed", () => {
    expect(
      checkChangesets({ files: ["apps/web/src/a.tsx"], changesets: [], packages }),
    ).toEqual([]);
  });

  it("fails when shipping code changed without a changeset", () => {
    const problems = checkChangesets({ files: engineChange, changesets: [], packages });

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("pnpm changeset");
  });

  it("accepts an empty changeset as an explicit opt-out", () => {
    expect(
      checkChangesets({ files: engineChange, changesets: [empty], packages }),
    ).toEqual([]);
  });

  it("demands an entry for the bundling package", () => {
    const problems = checkChangesets({
      files: engineChange,
      changesets: [coreMinor],
      packages,
    });

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("@nykon/rhumb-cli");
  });

  it("passes when every affected package is named", () => {
    expect(
      checkChangesets({ files: engineChange, changesets: [both], packages }),
    ).toEqual([]);
  });

  it("rejects private packages and unknown bump types", () => {
    const bad = parseChangeset(
      ".changeset/c.md",
      '---\n"@rhumb/engine": minor\n"@nykon/rhumb": huge\n---\n',
    );
    const problems = checkChangesets({ files: [], changesets: [bad], packages });

    expect(problems).toHaveLength(2);
  });
});

describe("changelogSection", () => {
  const changelog = [
    "# @nykon/rhumb",
    "",
    "## 0.2.0",
    "",
    "### Minor Changes",
    "",
    "- abc: Add things",
    "",
    "## 0.1.0",
    "",
    "- Initial release",
    "",
  ].join("\n");

  it("returns just the requested section", () => {
    expect(changelogSection(changelog, "0.2.0")).toBe(
      "### Minor Changes\n\n- abc: Add things",
    );
    expect(changelogSection(changelog, "0.1.0")).toBe("- Initial release");
  });

  it("returns null for a missing version", () => {
    expect(changelogSection(changelog, "0.3.0")).toBeNull();
    expect(changelogSection(changelog, "0.2")).toBeNull();
  });
});

describe("latestTagVersion / pendingPackages", () => {
  const tags = [
    "v26.11.3",
    "@nykon/rhumb@0.1.0",
    "@nykon/rhumb@0.10.0",
    "@nykon/rhumb@0.2.0",
    "@nykon/rhumb-cli@5.0.0",
  ];

  it("picks the highest SemVer tag of exactly that package", () => {
    expect(latestTagVersion("@nykon/rhumb", tags)).toBe("0.10.0");
    expect(latestTagVersion("@nykon/rhumb-cli", tags)).toBe("5.0.0");
    expect(latestTagVersion("@nykon/other", tags)).toBeNull();
  });

  it("is pending when the current version has no tag", () => {
    const core = pkg("@nykon/rhumb", "packages/core", [], false, "0.11.0");

    expect(pendingPackages([core], tags)).toEqual([
      { pkg: core, previous: "0.10.0" },
    ]);
  });

  it("is not pending once tagged, nor while it is the 0.0.0 placeholder", () => {
    const released = pkg("@nykon/rhumb", "packages/core", [], false, "0.10.0");
    const placeholder = pkg("@nykon/new", "packages/new", [], false, "0.0.0");

    expect(pendingPackages([released, placeholder], tags)).toEqual([]);
  });
});

describe("versionProblems", () => {
  const tags = ["@nykon/rhumb@0.1.0", "@nykon/rhumb@0.1.1"];
  const changelog = "# @nykon/rhumb\n\n## 0.2.0\n\n- x\n\n## 0.1.1\n\n- y\n";
  const core = (version: string): Pkg =>
    pkg("@nykon/rhumb", "packages/core", [], false, version);

  it("accepts a new version that moves forward and has a changelog section", () => {
    expect(versionProblems(core("0.2.0"), tags, changelog)).toEqual([]);
  });

  it("accepts a package that is simply at its last release", () => {
    expect(versionProblems(core("0.1.1"), tags, changelog)).toEqual([]);
  });

  it("accepts the never-released placeholder", () => {
    expect(versionProblems(core("0.0.0"), [], "")).toEqual([]);
  });

  it("rejects a version that is not SemVer", () => {
    expect(versionProblems(core("26.11"), [], "")[0]).toContain("not a valid SemVer");
  });

  it("rejects a version older than the last release, tagged or not", () => {
    expect(versionProblems(core("0.1.0"), tags, changelog)[0]).toContain("older");
    expect(versionProblems(core("0.0.9"), tags, changelog)[0]).toContain("older");
  });

  it("rejects a bump that has no changelog section", () => {
    const problems = versionProblems(core("0.3.0"), tags, changelog);

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('"## 0.3.0"');
  });
});

describe("planRows", () => {
  it("shows the last release and the pending version", () => {
    const core = pkg("@nykon/rhumb", "packages/core", [], false, "0.2.0");

    expect(planRows([{ pkg: core, previous: "0.1.0" }])).toEqual([
      "- `@nykon/rhumb` 0.1.0 → **0.2.0**",
    ]);
  });

  it("marks a package that was never released as new", () => {
    const core = pkg("@nykon/rhumb", "packages/core", [], false, "0.1.0");

    expect(planRows([{ pkg: core, previous: null }])).toEqual([
      "- `@nykon/rhumb` (new) → **0.1.0**",
    ]);
  });
});
