import { type ParseArgsOptionsConfig, parseArgs } from "node:util";

import { UsageError } from "./io";

export interface Parsed<T extends ParseArgsOptionsConfig> {
  readonly values: ReturnType<typeof parseArgs<{ options: T }>>["values"];
  readonly positionals: readonly string[];
}

export function parse<T extends ParseArgsOptionsConfig>(
  args: readonly string[],
  options: T,
): Parsed<T> {
  try {
    const { values, positionals } = parseArgs({
      args: [...args],
      options,
      allowPositionals: true,
      strict: true,
    });

    return { values, positionals };
  } catch (error) {
    throw new UsageError(
      error instanceof Error
        ? (error.message.split(". ")[0] ?? error.message)
        : "Bad arguments",
    );
  }
}

export function toNumber(
  flag: string,
  text: string | undefined,
): number | undefined {
  if (text === undefined) {
    return undefined;
  }

  const value = Number(text);

  if (text.trim() === "" || !Number.isFinite(value)) {
    throw new UsageError(`--${flag} expects a number, got "${text}"`);
  }

  return value;
}
