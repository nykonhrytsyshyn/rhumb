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

export type DiagramsReference = (typeof DIAGRAMS_REFERENCES)[number];

const REFERENCE_LINK = /\[([^\]]+)\]\(references\/(\w+)\.md\)/g;

export function buildReference(
  input: Pick<AgentKitInput, "sources" | "version">,
  name: DiagramsReference,
): string {
  const text = forSkill(
    fill(source({ ...input, validator: "" }, referencePath(name)), {
      version: input.version,
      homepage: AGENT_KIT_HOMEPAGE,
    }),
  );

  return text.replace(
    REFERENCE_LINK,
    (_whole, label: string, topic: string) =>
      `${label} (\`rhumb guide ${topic}\`)`,
  );
}

/**
 * The skill of the command line: a few lines that send the agent to
 * `rhumb guide`, `rhumb check` and `rhumb render`. The instructions stay in
 * the CLI, so they always match the parser that is installed, and the agent
 * reads only the part of them it needs.
 */
export function buildCliSkill(version: string): string {
  return fill(CLI_SKILL, { version });
}

const CLI_SKILL = `---
name: ${DIAGRAMS_SKILL_NAME}
description: "Write, fix and draw flowcharts and block diagrams in Rhumb's text syntax (GOST 19.701-90, ISO 5807; блок-схема, схема алгоритму) with the rhumb command line. Use whenever the user mentions Rhumb or asks for a flowchart, algorithm scheme or program flow by a standard. Rhumb's syntax is NOT Mermaid: read it with rhumb guide before writing."
---

# Rhumb diagrams (command line)

The \`rhumb\` command carries the instructions for the version that is installed, so use them instead of what you remember about Mermaid. Install: \`npm install --global @nykon/rhumb-cli\` (written for {{version}}).

1. **Learn**: \`rhumb guide --short\` is a cheat sheet. For detail, \`rhumb guide <topic>\` prints one part (\`rhumb guide --list\` names them: syntax, blocks, lines, structure, pitfalls, workflow, examples).
2. **Write** the diagram to a file such as \`diagram.rhumb\`.
3. **Check**: \`rhumb check diagram.rhumb\`. It names the line that is wrong; fix it and run it again, at most five times.
4. **Draw** when a picture is wanted: \`rhumb render diagram.rhumb -o diagram.png\` (\`.svg\`, \`.png\`, \`.jpg\` or \`.webp\`). \`rhumb render --help\` lists the options; \`--profile gost-19.701-90\` draws by GOST.
5. **Deliver** the diagram text in one fenced block tagged \`rhumb\`, the assumptions you made, and the picture.
`;
