import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { run } from "./cli";
import type { Environment } from "./io";

const SOURCE = `flowchart TD
  s(["Start"]) --> w["x = 1"]
  w --> d{"x > 0?"}
  d -->|Yes| e(["Stop"])
  d -->|No| w`;

const KIT_SOURCES: Record<string, string> = {
  "diagrams/SKILL.md":
    "---\nname: rhumb-diagrams\ndescription: d\n---\nSKILL BODY {{version}}",
  "diagrams/prompt-header.md": "HEADER",
  "diagrams/prompt-short.md": "SHORT PROMPT {{version}}",
  ...Object.fromEntries(
    [
      "syntax",
      "blocks",
      "lines",
      "structure",
      "pitfalls",
      "workflow",
      "examples",
    ].map((name) => [`diagrams/references/${name}.md`, `# ${name}`]),
  ),
};

interface Run {
  readonly code: number;
  readonly stdout: string;
  readonly stdoutBytes: Uint8Array[];
  readonly stderr: string;
}

let folder: string;

beforeEach(async () => {
  folder = await mkdtemp(join(tmpdir(), "rhumb-cli-"));
});

afterEach(async () => {
  await rm(folder, { recursive: true, force: true });
});

async function cli(
  argv: readonly string[],
  options: { stdin?: string | Uint8Array; stdoutIsTty?: boolean } = {},
): Promise<Run> {
  let stdout = "";
  let stderr = "";
  const stdoutBytes: Uint8Array[] = [];
  const environment: Environment = {
    version: "26.1.1",
    agentSources: () => KIT_SOURCES,
    io: {
      readStdin: () =>
        Promise.resolve(
          typeof options.stdin === "string"
            ? new TextEncoder().encode(options.stdin)
            : (options.stdin ?? new Uint8Array()),
        ),
      stdinIsTty: options.stdin === undefined,
      stdoutIsTty: options.stdoutIsTty ?? false,
      writeStdout: (data) => {
        if (typeof data === "string") {
          stdout += data;
        } else {
          stdoutBytes.push(data);
        }
      },
      writeStderr: (text) => {
        stderr += text;
      },
    },
  };
  const code = await run(argv, environment);

  return { code, stdout, stdoutBytes, stderr };
}

async function diagram(name = "a.rhumb", text = SOURCE): Promise<string> {
  const path = join(folder, name);

  await writeFile(path, text);

  return path;
}

describe("help and version", () => {
  it("shows the help without a command, and for --help", async () => {
    for (const argv of [[], ["--help"], ["help"]]) {
      const result = await cli(argv);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain("Commands:");
    }
  });

  it("shows the version", async () => {
    expect((await cli(["--version"])).stdout).toBe("26.1.1\n");
  });

  it("shows the help of each command", async () => {
    for (const command of [
      "render",
      "check",
      "profiles",
      "presets",
      "guide",
      "skill",
    ]) {
      const result = await cli([command, "--help"]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain(`rhumb ${command}`);
    }
  });

  it("exits with 2 on an unknown command or flag", async () => {
    expect(await cli(["nope"])).toMatchObject({ code: 2 });
    expect((await cli(["render", "--wat"])).code).toBe(2);
  });
});

describe("check", () => {
  it("reports a valid diagram", async () => {
    const path = await diagram();
    const result = await cli(["check", path]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("4 blocks, 4 lines");
  });

  it("reports the first problem with its line and exits with 1", async () => {
    const path = await diagram("bad.rhumb", "flowchart TD\n  a -->");
    const result = await cli(["check", path]);

    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/bad\.rhumb:2: /);
  });

  it("checks piped input and prints JSON on request", async () => {
    const result = await cli(["check", "--json"], { stdin: SOURCE });

    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      results: [{ file: "stdin", ok: true, nodes: 4, edges: 4 }],
    });
  });

  it("fails when any of several files is invalid", async () => {
    const good = await diagram("good.rhumb");
    const bad = await diagram("bad.rhumb", "flowchart TD\n  a -->");

    expect((await cli(["check", good, bad])).code).toBe(1);
  });

  it("asks for input instead of waiting on a terminal", async () => {
    const result = await cli(["check"]);

    expect(result.code).toBe(2);
    expect(result.stderr).toContain("No input");
  });

  it("says that a file is missing", async () => {
    const result = await cli(["check", join(folder, "none.rhumb")]);

    expect(result.code).toBe(2);
    expect(result.stderr).toContain("no such file");
  });
});

describe("render", () => {
  it("writes SVG to stdout by default", async () => {
    const result = await cli(["render", await diagram()]);

    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/^<\?xml [^>]*encoding="UTF-8"\?>\n<svg/);
  });

  it("reads the diagram from stdin", async () => {
    const result = await cli(["render", "-"], { stdin: SOURCE });

    expect(result.stdout).toContain("<svg");
  });

  it("takes the format from the extension of the output", async () => {
    const png = join(folder, "a.png");
    const result = await cli(["render", await diagram(), "-o", png]);

    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/^Wrote .*a\.png \(\d+x\d+ px\)/);
    expect([...(await readFile(png)).subarray(1, 4)]).toEqual([
      0x50, 0x4e, 0x47,
    ]);
  });

  it("writes WebP and reports the size as JSON", async () => {
    const webp = join(folder, "a.webp");
    const result = await cli(["render", await diagram(), "-o", webp, "--json"]);
    const info = JSON.parse(result.stdout) as { format: string; width: number };

    expect(info).toMatchObject({ output: webp, format: "webp" });
    expect(info.width).toBeGreaterThan(0);
    expect((await readFile(webp)).subarray(8, 12).toString()).toBe("WEBP");
  });

  it("applies the profile, the preset and the colours", async () => {
    const result = await cli([
      "render",
      await diagram(),
      "--profile",
      "gost-19.701-90",
      "--preset",
      "dark",
      "--ink",
      "#123456",
    ]);

    expect(result.stdout).toContain("#101014");
    expect(result.stdout).toContain("#123456");
  });

  it("uses a profile from a file", async () => {
    const profile = await cli(["profiles", "show", "iso-5807"]);
    const file = join(folder, "mine.json");

    await writeFile(
      file,
      JSON.stringify({
        ...JSON.parse(profile.stdout),
        id: "mine",
        default: false,
      }),
    );

    const result = await cli([
      "render",
      await diagram(),
      "--profile-file",
      file,
    ]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("<svg");
  });

  it("rejects a profile file that is not a profile", async () => {
    const file = join(folder, "bad.json");

    await writeFile(file, JSON.stringify({ id: "x" }));

    expect(
      (await cli(["render", await diagram(), "--profile-file", file])).code,
    ).toBe(2);
  });

  it("refuses to print binary to a terminal", async () => {
    const result = await cli(["render", await diagram(), "--format", "png"], {
      stdoutIsTty: true,
    });

    expect(result.code).toBe(2);
    expect(result.stderr).toContain("-o <file>");
  });

  it("lets binary go down a pipe", async () => {
    const result = await cli(["render", await diagram(), "--format", "png"]);

    expect(result.code).toBe(0);
    expect(result.stdoutBytes).toHaveLength(1);
  });

  it("explains an invalid diagram and exits with 1", async () => {
    const path = await diagram("bad.rhumb", "flowchart TD\n  a -->");
    const result = await cli(["render", path]);

    expect(result.code).toBe(1);
    expect(result.stderr).toMatch(/^Line 2: /);
  });

  it.each([
    [["--padding", "abc"], /expects a number/],
    [["--padding", "999"], /padding/],
    [["--scale", "9"], /--scale expects/],
    [["--preset", "neon"], /--preset expects/],
    [["--format", "gif"], /--format expects/],
    [["--font", "no-equals"], /--font expects/],
    [["--font", "A=/does/not/exist.ttf"], /Cannot read the font/],
    [["-o", "x.unknown"], /Cannot tell the format/],
    [["--profile", "nope"], /nope/],
  ])("exits with 2 for %j", async (flags, message) => {
    const result = await cli(["render", await diagram(), ...flags]);

    expect(result.code).toBe(2);
    expect(result.stderr).toMatch(message);
  });

  it("draws an image with a TTF font, and says no to WOFF2", async () => {
    const woff2 = join(folder, "a.woff2");

    await writeFile(woff2, Uint8Array.from([0x77, 0x4f, 0x46, 0x32, 1]));

    const result = await cli([
      "render",
      await diagram(),
      "-o",
      join(folder, "f.png"),
      "--profile",
      "gost-19.701-90",
      "--font",
      `OpenGost Type A=${woff2}`,
    ]);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("TTF or OTF");
  });

  it("embeds a font into an SVG", async () => {
    const font = join(folder, "a.woff2");

    await writeFile(font, Uint8Array.from([0x77, 0x4f, 0x46, 0x32, 1]));

    const result = await cli([
      "render",
      await diagram(),
      "--profile",
      "gost-19.701-90",
      "--font",
      `OpenGost Type A=${font}`,
    ]);

    expect(result.stdout).toContain("@font-face");
  });
});

describe("profiles and presets", () => {
  it("lists the standards and marks the default", async () => {
    const result = await cli(["profiles"]);

    expect(result.stdout).toContain("gost-19.701-90");
    expect(result.stdout).toMatch(/iso-5807.*\(default\)/);
  });

  it("lists them as JSON", async () => {
    const list = JSON.parse((await cli(["profiles", "--json"])).stdout) as {
      id: string;
      default: boolean;
    }[];

    expect(list.map((profile) => profile.id)).toContain("iso-5807");
    expect(list.filter((profile) => profile.default)).toHaveLength(1);
  });

  it("prints one profile as JSON, and knows when there is none", async () => {
    expect(
      JSON.parse((await cli(["profiles", "show", "iso-5807"])).stdout),
    ).toMatchObject({
      id: "iso-5807",
    });

    const missing = await cli(["profiles", "show", "nope"]);

    expect(missing.code).toBe(2);
    expect(missing.stderr).toContain("iso-5807");
    expect((await cli(["profiles", "show"])).code).toBe(2);
    expect((await cli(["profiles", "wat"])).code).toBe(2);
  });

  it("lists the presets", async () => {
    expect((await cli(["presets"])).stdout).toContain("blueprint");
    expect(
      Object.keys(
        JSON.parse((await cli(["presets", "--json"])).stdout) as Record<
          string,
          unknown
        >,
      ),
    ).toContain("dark");
  });
});

describe("guide", () => {
  it("prints the full instructions with the version filled in", async () => {
    const result = await cli(["guide"]);

    expect(result.code).toBe(0);
    expect(
      result.stdoutBytes.map((chunk) => Buffer.from(chunk).toString()).join(""),
    ).toContain("SKILL BODY 26.1.1");
  });

  it("prints the short cheat sheet", async () => {
    const result = await cli(["guide", "--short"]);

    expect(Buffer.from(result.stdoutBytes[0] ?? []).toString()).toContain(
      "SHORT PROMPT 26.1.1",
    );
  });
});

describe("guide topics and skill", () => {
  const text = (run: Run): string =>
    run.stdout +
    run.stdoutBytes.map((chunk) => Buffer.from(chunk).toString()).join("");

  it("lists the topics and prints one of them", async () => {
    expect((await cli(["guide", "--list"])).stdout.split("\n")).toContain(
      "pitfalls",
    );
    expect(text(await cli(["guide", "workflow"]))).toContain("# workflow");
  });

  it("names the topics when one is wrong", async () => {
    const result = await cli(["guide", "nope"]);

    expect(result.code).toBe(2);
    expect(result.stderr).toContain("pitfalls");
    expect((await cli(["guide", "a", "b"])).code).toBe(2);
  });

  it("prints the skill", async () => {
    const result = await cli(["skill"]);

    expect(result.stdout).toMatch(/^---\nname: rhumb-diagrams/);
    expect(result.stdout).toContain("26.1.1");
  });

  it("writes the skill into a folder", async () => {
    const result = await cli(["skill", "--dir", join(folder, "skills")]);
    const file = join(folder, "skills", "rhumb-diagrams", "SKILL.md");

    expect(result.stdout).toContain("SKILL.md");
    expect(await readFile(file, "utf8")).toContain("rhumb check");
  });
});

describe("encoding", () => {
  const CYRILLIC = 'flowchart TD\n  s(["Початок"]) --> w["Привіт, світе!"]';

  async function write(name: string, bytes: Uint8Array): Promise<string> {
    const path = join(folder, name);

    await writeFile(path, bytes);

    return path;
  }

  function utf16le(text: string): Uint8Array {
    const body = Buffer.from(text, "utf16le");

    return Buffer.concat([Buffer.from([0xff, 0xfe]), body]);
  }

  function windows1251(): Uint8Array {
    return Uint8Array.from([
      ...new TextEncoder().encode('flowchart TD\n  s(["'),
      0xcf,
      0xee,
      0xf7,
      0xe0,
      0xf2,
      0xee,
      0xea,
      ...new TextEncoder().encode('"]) --> e(["'),
      0xca,
      0xb3,
      0xed,
      0xe5,
      0xf6,
      0xfc,
      ...new TextEncoder().encode('"])'),
    ]);
  }

  it("keeps Cyrillic and says UTF-8 in an XML declaration", async () => {
    const result = await cli(["render", await diagram("c.rhumb", CYRILLIC)]);

    expect(
      result.stdout.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<svg'),
    ).toBe(true);
    expect(result.stdout).toContain("Привіт, світе!");
  });

  it("writes the same UTF-8 bytes to a file", async () => {
    const out = join(folder, "c.svg");

    await cli(["render", await diagram("c.rhumb", CYRILLIC), "-o", out]);

    const bytes = await readFile(out);

    expect(bytes.subarray(0, 5).toString()).toBe("<?xml");
    expect(bytes.toString("utf8")).toContain("Початок");
  });

  it("can leave the declaration off", async () => {
    const result = await cli([
      "render",
      await diagram("c.rhumb", CYRILLIC),
      "--no-xml-declaration",
    ]);

    expect(result.stdout.startsWith("<svg")).toBe(true);
  });

  it("reads piped bytes as UTF-8", async () => {
    const result = await cli(["render", "-"], { stdin: CYRILLIC });

    expect(result.stdout).toContain("Привіт, світе!");
  });

  it("reads a file that starts with a UTF-8 BOM", async () => {
    const bytes = Buffer.concat([
      Buffer.from([0xef, 0xbb, 0xbf]),
      Buffer.from(CYRILLIC),
    ]);
    const result = await cli(["render", await write("bom.rhumb", bytes)]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Привіт");
  });

  it("reads UTF-16 files, as PowerShell redirection writes them", async () => {
    const result = await cli([
      "render",
      await write("u16.rhumb", utf16le(CYRILLIC)),
    ]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Привіт");
  });

  it("refuses Windows-1251 instead of drawing gibberish, and says what to do", async () => {
    const path = await write("old.rhumb", windows1251());
    const result = await cli(["render", path]);

    expect(result.code).toBe(2);
    expect(result.stderr).toContain("windows-1251");
  });

  it("reads Windows-1251 when told to", async () => {
    const path = await write("old.rhumb", windows1251());
    const result = await cli([
      "render",
      path,
      "--input-encoding",
      "windows-1251",
    ]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Початок");
    expect(
      (await cli(["check", path, "--input-encoding", "windows-1251"])).code,
    ).toBe(0);
  });

  it("rejects an encoding it does not know", async () => {
    const result = await cli([
      "check",
      await diagram(),
      "--input-encoding",
      "klingon",
    ]);

    expect(result.code).toBe(2);
    expect(result.stderr).toContain("klingon");
  });

  it("reads a profile file with a BOM", async () => {
    const profile = (await cli(["profiles", "show", "iso-5807"])).stdout;
    const file = await write(
      "p.json",
      Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(profile)]),
    );
    const result = await cli([
      "render",
      await diagram(),
      "--profile-file",
      file,
    ]);

    expect(result.code).toBe(0);
  });
});

describe("fonts in the CLI", () => {
  async function fontFile(): Promise<string> {
    const path = join(folder, "f.woff2");

    await writeFile(path, Uint8Array.from([0x77, 0x4f, 0x46, 0x32, 1]));

    return path;
  }

  it("embeds a font in the SVG when the profile's stack names it", async () => {
    const result = await cli([
      "render",
      await diagram(),
      "--profile",
      "gost-19.701-90",
      "--font",
      `OpenGost Type A=${await fontFile()}`,
    ]);

    expect(result.stdout).toContain("@font-face");
    expect(result.stderr).toBe("");
  });

  it("warns, and embeds nothing, when the profile's stack does not name it", async () => {
    const result = await cli([
      "render",
      await diagram(),
      "--profile",
      "iso-5807",
      "--font",
      `OpenGost Type A=${await fontFile()}`,
    ]);

    expect(result.code).toBe(0);
    expect(result.stdout).not.toContain("@font-face");
    expect(result.stderr).toMatch(
      /OpenGost Type A.*not in the font stack of iso-5807/,
    );
  });
});

describe("layout follows the font", () => {
  const FONT = resolve(
    import.meta.dirname,
    "../../web/src/shared/assets/fonts/OpenGost-Type-A.woff2",
  );
  const width = (svg: string): number =>
    Number(/<svg[^>]*width="([\d.]+)"/.exec(svg)?.[1]);

  it("measures text with a WOFF2 font, so the diagram size changes", async () => {
    const path = await diagram("w.rhumb", SOURCE);
    const args = ["render", path, "--profile", "gost-19.701-90"];
    const estimated = await cli(args);
    const measured = await cli([...args, "--font", `OpenGost Type A=${FONT}`]);

    expect(width(measured.stdout)).not.toBe(width(estimated.stdout));
    expect(measured.stdout).toContain("@font-face");
  });
});
