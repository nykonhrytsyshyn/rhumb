import {
  fill,
  forPrompt,
  forSkill,
  stripFrontmatter,
} from "../../internal/transform";
import { createZip } from "../zip";
import {
  AGENT_KIT_FILES,
  AGENT_KIT_HOMEPAGE,
  type AgentKitId,
} from "./manifest";

export const DIAGRAMS_SKILL_NAME = "rhumb-diagrams";
export const DIAGRAMS_REFERENCES = [
  "syntax",
  "blocks",
  "lines",
  "structure",
  "pitfalls",
  "workflow",
  "examples",
] as const;

export interface AgentKitInput {
  readonly version: string;
  readonly sources: Readonly<Record<string, string>>;
  readonly validator: string;
}

export interface AgentKitFile {
  readonly id: AgentKitId;
  readonly fileName: string;
  readonly mime: string;
  readonly data: Uint8Array;
}

const ENCODER = new TextEncoder();

function source(input: AgentKitInput, path: string): string {
  const text = input.sources[path];

  if (text === undefined) {
    throw new Error(`The agent kit has no content file "${path}"`);
  }

  return text;
}

function referencePath(name: string): string {
  return `diagrams/references/${name}.md`;
}

function skillArchive(input: AgentKitInput): Uint8Array {
  const values = {
    version: input.version,
    homepage: AGENT_KIT_HOMEPAGE,
  };
  const root = DIAGRAMS_SKILL_NAME;

  return createZip([
    {
      path: `${root}/SKILL.md`,
      data: forSkill(fill(source(input, "diagrams/SKILL.md"), values)),
    },
    ...DIAGRAMS_REFERENCES.map((name) => ({
      path: `${root}/references/${name}.md`,
      data: forSkill(fill(source(input, referencePath(name)), values)),
    })),
    { path: `${root}/scripts/validate.mjs`, data: input.validator },
  ]);
}

function fullPrompt(input: AgentKitInput): string {
  const values = { version: input.version, homepage: AGENT_KIT_HOMEPAGE };
  const parts = [
    source(input, "diagrams/prompt-header.md"),
    source(input, "diagrams/SKILL.md"),
    ...DIAGRAMS_REFERENCES.map((name) => source(input, referencePath(name))),
  ];

  return `${parts
    .map((part) => forPrompt(fill(stripFrontmatter(part), values)).trim())
    .join("\n\n---\n\n")}\n`;
}

function shortPrompt(input: AgentKitInput): string {
  return `${forPrompt(
    fill(source(input, "diagrams/prompt-short.md"), {
      version: input.version,
      homepage: AGENT_KIT_HOMEPAGE,
    }),
  ).trim()}\n`;
}

export function buildAgentKit(input: AgentKitInput): readonly AgentKitFile[] {
  const outputs: Readonly<Record<AgentKitId, () => Uint8Array | string>> = {
    diagramsSkill: () => skillArchive(input),
    diagramsPrompt: () => fullPrompt(input),
    diagramsPromptShort: () => shortPrompt(input),
  };

  return AGENT_KIT_FILES.map((info) => {
    const made = outputs[info.id]();

    return {
      id: info.id,
      fileName: info.fileName,
      mime: info.mime,
      data: typeof made === "string" ? ENCODER.encode(made) : made,
    };
  });
}
