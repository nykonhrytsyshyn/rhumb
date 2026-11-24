import { check } from "@nykon/rhumb/node";

import { CHECK_HELP } from "../help";
import { readSource } from "../input";
import { EXIT_FAILED, EXIT_OK, type Io } from "../io";
import { parse } from "../options";

interface Result {
  readonly file: string;
  readonly outcome: ReturnType<typeof check>;
}

export async function checkCommand(
  args: readonly string[],
  io: Io,
): Promise<number> {
  const { values, positionals } = parse(args, {
    json: { type: "boolean" },
    "input-encoding": { type: "string" },
    help: { type: "boolean", short: "h" },
  });

  if (values.help === true) {
    io.writeStdout(CHECK_HELP);

    return EXIT_OK;
  }

  const paths = positionals.length === 0 ? [undefined] : positionals;
  const results: Result[] = [];

  for (const path of paths) {
    const source = await readSource(path, io, values["input-encoding"]);

    results.push({ file: source.name, outcome: check(source.text) });
  }

  if (values.json === true) {
    io.writeStdout(
      `${JSON.stringify(
        {
          results: results.map(({ file, outcome }) => ({ file, ...outcome })),
        },
        null,
        2,
      )}\n`,
    );
  } else {
    for (const { file, outcome } of results) {
      if (outcome.ok) {
        io.writeStdout(
          `OK ${file}: ${String(outcome.nodes)} blocks, ${String(outcome.edges)} lines\n`,
        );
      } else {
        io.writeStderr(`${file}:${String(outcome.line)}: ${outcome.message}\n`);
      }
    }
  }

  return results.every(({ outcome }) => outcome.ok) ? EXIT_OK : EXIT_FAILED;
}
