import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  DIAGRAMS_REFERENCES,
  DIAGRAMS_SKILL_NAME,
  type DiagramsReference,
  buildAgentKit,
  buildCliSkill,
  buildReference,
} from "@rhumb/agent-kit";

import { GUIDE_HELP, SKILL_HELP } from "../help";
import { EXIT_OK, type Environment, UsageError } from "../io";
import { parse } from "../options";

function topicOf(name: string): DiagramsReference {
  const topic = DIAGRAMS_REFERENCES.find((known) => known === name);

  if (topic === undefined) {
    throw new UsageError(
      `No topic "${name}". Topics: ${DIAGRAMS_REFERENCES.join(", ")}`,
    );
  }

  return topic;
}

export function guideCommand(
  args: readonly string[],
  environment: Environment,
): number {
  const { values, positionals } = parse(args, {
    short: { type: "boolean" },
    list: { type: "boolean" },
    help: { type: "boolean", short: "h" },
  });
  const { io } = environment;

  if (values.help === true) {
    io.writeStdout(GUIDE_HELP);

    return EXIT_OK;
  }

  if (values.list === true) {
    io.writeStdout(`${DIAGRAMS_REFERENCES.join("\n")}\n`);

    return EXIT_OK;
  }

  if (positionals.length > 1) {
    throw new UsageError("Give one topic: rhumb guide <topic>");
  }

  const [name] = positionals;

  if (name !== undefined) {
    io.writeStdout(
      buildReference(
        { version: environment.version, sources: environment.agentSources() },
        topicOf(name),
      ),
    );

    return EXIT_OK;
  }

  const wanted =
    values.short === true ? "diagramsPromptShort" : "diagramsPrompt";
  const file = buildAgentKit({
    version: environment.version,
    sources: environment.agentSources(),
    validator: "",
  }).find((candidate) => candidate.id === wanted);

  if (file === undefined) {
    throw new Error(`The agent kit has no "${wanted}"`);
  }

  io.writeStdout(file.data);

  return EXIT_OK;
}

export async function skillCommand(
  args: readonly string[],
  environment: Environment,
): Promise<number> {
  const { values } = parse(args, {
    dir: { type: "string" },
    help: { type: "boolean", short: "h" },
  });
  const { io } = environment;

  if (values.help === true) {
    io.writeStdout(SKILL_HELP);

    return EXIT_OK;
  }

  const text = buildCliSkill(environment.version);

  if (values.dir === undefined) {
    io.writeStdout(text);

    return EXIT_OK;
  }

  const folder = join(values.dir, DIAGRAMS_SKILL_NAME);

  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, "SKILL.md"), text);
  io.writeStdout(`Wrote ${join(folder, "SKILL.md")}\n`);

  return EXIT_OK;
}
