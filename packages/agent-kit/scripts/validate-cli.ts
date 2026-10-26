/**
 * Entry of `scripts/validate.mjs` inside the skill: checks a diagram file
 * (or text on stdin) and prints either OK or the first problem.
 *
 * Exit codes: 0 the diagram is valid, 1 it is not, 2 the call was wrong.
 */
import { readFileSync } from "node:fs";
import process from "node:process";

import { validateSource } from "../src";

function readInput(argument: string | undefined): string {
  return readFileSync(
    argument === undefined || argument === "-" ? 0 : argument,
    "utf8",
  );
}

function main(): number {
  const [arg, ...rest] = process.argv.slice(2);

  if (rest.length > 0 || arg === "--help" || arg === "-h") {
    process.stdout.write(
      "Usage: node validate.mjs <file.rhumb>   (or pipe the diagram in)\n",
    );

    return arg === "--help" || arg === "-h" ? 0 : 2;
  }

  let src: string;

  try {
    src = readInput(arg);
  } catch (error) {
    process.stderr.write(
      `Cannot read the diagram: ${error instanceof Error ? error.message : String(error)}\n`,
    );

    return 2;
  }

  const result = validateSource(src);

  if (result.ok) {
    process.stdout.write(
      `OK: ${String(result.blocks)} blocks, ${String(result.lines)} lines, ${String(result.frames)} frames\n`,
    );

    return 0;
  }

  process.stdout.write(`${result.message}\n`);

  return 1;
}

process.exitCode = main();
