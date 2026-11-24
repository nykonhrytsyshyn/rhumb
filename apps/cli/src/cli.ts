import {
  DiagramSyntaxError,
  ExportOptionError,
  InvalidProfileError,
  MissingDependencyError,
} from "@nykon/rhumb/node";

import { checkCommand } from "./commands/check";
import { guideCommand, skillCommand } from "./commands/guide";
import { presetsCommand, profilesCommand } from "./commands/profiles";
import { renderCommand } from "./commands/render";
import { MAIN_HELP } from "./help";
import {
  EXIT_FAILED,
  EXIT_OK,
  EXIT_USAGE,
  type Environment,
  UsageError,
} from "./io";

async function dispatch(
  argv: readonly string[],
  environment: Environment,
): Promise<number> {
  const { io } = environment;
  const [command, ...rest] = argv;

  switch (command) {
    case undefined:
    case "help":
    case "-h":
    case "--help":
      io.writeStdout(MAIN_HELP);

      return EXIT_OK;
    case "-v":
    case "--version":
    case "version":
      io.writeStdout(`${environment.version}\n`);

      return EXIT_OK;
    case "render":
      return renderCommand(rest, io);
    case "check":
      return checkCommand(rest, io);
    case "profiles":
      return profilesCommand(rest, io);
    case "presets":
      return presetsCommand(rest, io);
    case "guide":
      return guideCommand(rest, environment);
    case "skill":
      return skillCommand(rest, environment);
    default:
      throw new UsageError(`Unknown command "${command}". Run "rhumb --help"`);
  }
}

export async function run(
  argv: readonly string[],
  environment: Environment,
): Promise<number> {
  const { io } = environment;

  try {
    return await dispatch(argv, environment);
  } catch (error) {
    if (error instanceof DiagramSyntaxError) {
      io.writeStderr(
        `Line ${String(error.line)}: ${error.message.replace(/^Line \d+: /, "")}\n`,
      );

      return EXIT_FAILED;
    }

    if (
      error instanceof UsageError ||
      error instanceof ExportOptionError ||
      error instanceof InvalidProfileError
    ) {
      io.writeStderr(`${error.message}\n`);

      return EXIT_USAGE;
    }

    if (
      error instanceof MissingDependencyError ||
      error instanceof RangeError
    ) {
      io.writeStderr(`${error.message}\n`);

      return EXIT_FAILED;
    }

    io.writeStderr(
      `Unexpected error: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
    );

    return EXIT_FAILED;
  }
}
