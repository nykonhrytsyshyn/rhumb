import ELK from "elkjs/lib/elk.bundled.js";
import { describe, expect, it } from "vitest";

import { DiagramEngine } from "@rhumb/engine";
import { ElkLayoutEngine } from "@rhumb/layout-elk";
import { ProfileRegistry } from "@rhumb/profiles";
import {
  PROP_KEYS,
  SHAPE_DELIMITERS,
  SHAPE_NAMES,
} from "@rhumb/source-mermaid";

import { DIAGRAMS_REFERENCES } from "./api/kit";
import { validateSource } from "./api/validate";
import { markerBalance } from "./internal/transform";
import { fencedBlocks, loadContent } from "./testing/load-content";

const content = loadContent();
const markdownFiles = Object.entries(content).filter(([path]) =>
  path.endsWith(".md"),
);

const engine = new DiagramEngine({
  layoutEngine: new ElkLayoutEngine(new ELK()),
});
const profiles = ProfileRegistry.withBuiltins().list();

const valid = markdownFiles.flatMap(([file, text]) =>
  fencedBlocks(file, text, "rhumb"),
);
const invalid = markdownFiles.flatMap(([file, text]) =>
  fencedBlocks(file, text, "rhumb-invalid"),
);

function text(path: string): string {
  const found = content[path];

  if (found === undefined) {
    throw new Error(`Missing content file ${path}`);
  }

  return found;
}

describe("the examples in the content", () => {
  it("has examples to check", () => {
    expect(valid.length).toBeGreaterThan(20);
    expect(invalid.length).toBeGreaterThan(10);
  });

  it.each(valid.map((block) => [`${block.file}:${String(block.line)}`, block]))(
    "%s is valid and renders under every built-in profile",
    async (_name, block) => {
      expect(validateSource(block.code)).toMatchObject({ ok: true });

      for (const profile of profiles) {
        const drawn = await engine.render(block.code, { profile });

        expect(drawn.svg.startsWith("<svg ")).toBe(true);
      }
    },
  );

  it.each(
    invalid.map((block) => [`${block.file}:${String(block.line)}`, block]),
  )("%s fails with the message it announces", async (_name, block) => {
    const announced = /^%% error: (.+)$/m.exec(block.code)?.[1];

    expect(announced, "the block announces its error").toBeDefined();

    const result = validateSource(block.code);

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      message: expect.stringContaining(announced ?? "") as unknown,
    });

    // The checker and the app must read the text the same way.
    const [profile] = profiles;

    if (profile === undefined || result.ok) {
      throw new Error("No profile to render with");
    }

    await expect(engine.render(block.code, { profile })).rejects.toThrow(
      result.message,
    );
  });
});

describe("the skill folder", () => {
  const skill = text("diagrams/SKILL.md");
  const front = /^---\n([\s\S]*?)\n---\n/.exec(skill)?.[1] ?? "";

  it("names itself like its folder and describes when to use it", () => {
    const name = /^name: (.+)$/m.exec(front)?.[1];
    const description = /^description: (.+)$/m.exec(front)?.[1] ?? "";

    expect(name).toBe("rhumb-diagrams");
    expect(name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(description.length).toBeGreaterThan(200);
    expect(description.length).toBeLessThanOrEqual(1024);
    expect(front).toContain('version: "{{version}}"');
  });

  it("stays short enough to be loaded whole", () => {
    expect(skill.split("\n").length).toBeLessThan(500);
  });

  it("has a reference file for each entry of the list, and no other", () => {
    const files = Object.keys(content)
      .filter((path) => path.startsWith("diagrams/references/"))
      .map((path) =>
        path.replace("diagrams/references/", "").replace(".md", ""),
      )
      .toSorted();

    expect(files).toEqual([...DIAGRAMS_REFERENCES].toSorted());
  });

  it("links only to references that exist", () => {
    for (const [file, body] of markdownFiles) {
      for (const match of body.matchAll(/\]\(references\/([^)]+)\)/g)) {
        expect(
          content[`diagrams/references/${match[1] ?? ""}`],
          `${file} links to ${match[0]}`,
        ).toBeDefined();
      }
    }
  });

  it("pairs its audience markers", () => {
    for (const [file, body] of markdownFiles) {
      const balance = markerBalance(body);

      expect(balance.promptOpen, file).toBe(balance.promptClose);
      expect(balance.skillOpen, file).toBe(balance.skillClose);
    }
  });
});

function spells(body: string, open: string, close: string): boolean {
  return close === ""
    ? body.includes(open)
    : body.includes(`${open}"`) && body.includes(`"${close}`);
}

describe("the skill against the parser", () => {
  const blocks = text("diagrams/references/blocks.md");
  const short = text("diagrams/prompt-short.md");

  it("lists every form Rhumb adds to Mermaid, in the reference and in the short prompt", () => {
    const added = SHAPE_DELIMITERS.filter(
      (delimiters) => delimiters.shortcut === true,
    );

    for (const { open, close } of added) {
      expect(spells(blocks, open, close), `blocks.md: ${open}…${close}`).toBe(
        true,
      );
      expect(spells(short, open, close), `prompt-short: ${open}…${close}`).toBe(
        true,
      );
    }
  });

  it("lists every form Mermaid has", () => {
    const inherited = SHAPE_DELIMITERS.filter(
      (delimiters) => delimiters.shortcut !== true,
    );

    for (const { open, close } of inherited) {
      expect(
        blocks.includes(`${open}text${close}`) || spells(blocks, open, close),
        `blocks.md: ${open}…${close}`,
      ).toBe(true);
    }
  });

  it("names every block, by at least one of its shape names", () => {
    const kinds = new Set([...SHAPE_NAMES.values()].map((shape) => shape.kind));

    for (const kind of kinds) {
      const names = [...SHAPE_NAMES]
        .filter(([, shape]) => shape.kind === kind)
        .map(([name]) => name);

      expect(
        names.some((name) => blocks.includes(`\`${name}\``)),
        `blocks.md names none of ${names.join(", ")}`,
      ).toBe(true);
    }
  });

  it("explains every property", () => {
    for (const key of PROP_KEYS) {
      expect(blocks.includes(`\`${key}\``), key).toBe(true);
      expect(short.includes(key), key).toBe(true);
    }
  });
});
