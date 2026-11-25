import { describe, expect, it } from "vitest";

import { loadContent } from "../../testing/load-content";
import {
  DIAGRAMS_REFERENCES,
  DIAGRAMS_SKILL_NAME,
  buildAgentKit,
  buildCliSkill,
  buildReference,
} from "./build-agent-kit";
import { AGENT_KIT_FILES, agentKitPath } from "./manifest";

const sources = loadContent();
const files = buildAgentKit({
  version: "26.10.7",
  sources,
  validator: "// validator\n",
});
const decoder = new TextDecoder();

function fileText(id: string): string {
  const file = files.find((candidate) => candidate.id === id);

  if (file === undefined) {
    throw new Error(`No file ${id}`);
  }

  return decoder.decode(file.data);
}

function skillEntries(): ReadonlyMap<string, string> {
  const file = files.find((candidate) => candidate.id === "diagramsSkill");

  if (file === undefined) {
    throw new Error("No skill");
  }

  const view = new DataView(file.data.buffer, file.data.byteOffset);
  const end = file.data.length - 22;
  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  const result = new Map<string, string>();

  for (let index = 0; index < count; index += 1) {
    const size = view.getUint32(at + 24, true);
    const nameLength = view.getUint16(at + 28, true);
    const offset = view.getUint32(at + 42, true);
    const name = decoder.decode(
      file.data.subarray(at + 46, at + 46 + nameLength),
    );
    const start = offset + 30 + view.getUint16(offset + 26, true);

    result.set(name, decoder.decode(file.data.subarray(start, start + size)));
    at += 46 + nameLength;
  }

  return result;
}

describe("buildAgentKit", () => {
  it("makes every file of the manifest, under its name", () => {
    expect(files.map((file) => file.fileName)).toEqual(
      AGENT_KIT_FILES.map((file) => file.fileName),
    );
    expect(agentKitPath(AGENT_KIT_FILES[0] ?? { fileName: "" })).toBe(
      "/agents/rhumb-diagrams.zip",
    );
  });

  it("packs the skill as one folder named like the skill", () => {
    const entries = skillEntries();

    expect([...entries.keys()].toSorted()).toEqual(
      [
        `${DIAGRAMS_SKILL_NAME}/SKILL.md`,
        `${DIAGRAMS_SKILL_NAME}/references/blocks.md`,
        `${DIAGRAMS_SKILL_NAME}/references/examples.md`,
        `${DIAGRAMS_SKILL_NAME}/references/lines.md`,
        `${DIAGRAMS_SKILL_NAME}/references/pitfalls.md`,
        `${DIAGRAMS_SKILL_NAME}/references/structure.md`,
        `${DIAGRAMS_SKILL_NAME}/references/syntax.md`,
        `${DIAGRAMS_SKILL_NAME}/references/workflow.md`,
        `${DIAGRAMS_SKILL_NAME}/scripts/validate.mjs`,
      ].toSorted(),
    );
    expect(entries.get(`${DIAGRAMS_SKILL_NAME}/scripts/validate.mjs`)).toBe(
      "// validator\n",
    );
  });

  it("stamps the version into the skill and leaves no placeholder", () => {
    const entries = skillEntries();
    const skill = entries.get(`${DIAGRAMS_SKILL_NAME}/SKILL.md`) ?? "";

    expect(skill.startsWith("---\nname: rhumb-diagrams\n")).toBe(true);
    expect(skill).toContain('version: "26.10.7"');

    for (const [name, text] of entries) {
      expect(text, name).not.toMatch(/\{\{(version|homepage)\}\}/);
      expect(text, name).not.toMatch(/<!-- \/?(prompt|skill)-only -->/);
    }
  });

  it("keeps the checker in the skill and out of the prompts", () => {
    const skill = skillEntries();

    expect(skill.get(`${DIAGRAMS_SKILL_NAME}/SKILL.md`)).toContain(
      "scripts/validate.mjs",
    );
    expect(skill.get(`${DIAGRAMS_SKILL_NAME}/SKILL.md`)).not.toContain(
      "Go through the checklist in [workflow](references/workflow.md) before",
    );

    for (const id of ["diagramsPrompt", "diagramsPromptShort"]) {
      expect(fileText(id), id).not.toContain("validate.mjs");
    }
  });

  it("makes a prompt that stands alone", () => {
    const prompt = fileText("diagramsPrompt");

    expect(prompt.startsWith("# Instructions: writing diagrams")).toBe(true);
    expect(prompt).not.toMatch(/\{\{(version|homepage)\}\}/);
    expect(prompt).not.toContain("references/");
    expect(prompt).not.toMatch(/^name: rhumb-diagrams$/m);
    expect(prompt).not.toMatch(/<!-- \/?(prompt|skill)-only -->/);

    for (const heading of [
      "# Syntax",
      "# Blocks",
      "# Lines",
      "# Frames, comments, loops, parallel actions, transfers",
      "# Pitfalls",
      "# Workflow",
      "# Complete examples",
    ]) {
      expect(prompt, heading).toContain(`\n${heading}`);
    }

    expect(prompt).toContain("version 26.10.7");
  });

  it("makes a short prompt that is really short", () => {
    const short = fileText("diagramsPromptShort");
    const full = fileText("diagramsPrompt");

    expect(short).not.toMatch(/\{\{(version|homepage)\}\}/);
    expect(short.length).toBeLessThan(full.length / 2);
    expect(short.length).toBeLessThan(9000);
  });

  it("builds the same bytes twice", () => {
    const again = buildAgentKit({
      version: "26.10.7",
      sources,
      validator: "// validator\n",
    });

    expect(again.map((file) => [...file.data])).toEqual(
      files.map((file) => [...file.data]),
    );
  });

  it("names the file that is missing", () => {
    expect(() =>
      buildAgentKit({ version: "1", sources: {}, validator: "" }),
    ).toThrow('no content file "diagrams/SKILL.md"');
  });
});

describe("buildReference", () => {
  it.each(DIAGRAMS_REFERENCES)(
    "prints %s without skill-only links or markers",
    (name) => {
      const text = buildReference({ version: "26.10.7", sources }, name);

      expect(text.length).toBeGreaterThan(100);
      expect(text).not.toMatch(/\]\(references\//);
      expect(text).not.toMatch(/<!-- \/?(?:skill|prompt)-only -->/);
      expect(text).not.toContain("{{version}}");
    },
  );

  it("turns links to other references into the command that prints them", () => {
    const text = buildReference({ version: "1", sources }, "workflow");

    expect(text).toMatch(/`rhumb guide \w+`/);
  });

  it("keeps the CLI instructions of the skill-only parts", () => {
    expect(buildReference({ version: "1", sources }, "workflow")).toContain(
      "rhumb check diagram.rhumb",
    );
  });
});

describe("buildCliSkill", () => {
  const skill = buildCliSkill("26.10.7");

  it("is a short skill with the right name and the version filled in", () => {
    expect(skill).toMatch(/^---\nname: rhumb-diagrams\n/);
    expect(skill).toContain("26.10.7");
    expect(skill).not.toContain("{{");
    expect(skill.split("\n").length).toBeLessThan(30);
  });

  it("names every command it relies on, and only real topics", () => {
    for (const command of ["rhumb guide", "rhumb check", "rhumb render"]) {
      expect(skill).toContain(command);
    }

    for (const name of DIAGRAMS_REFERENCES) {
      expect(skill).toContain(name);
    }
  });
});
