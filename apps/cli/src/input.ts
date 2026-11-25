import { readFile } from "node:fs/promises";

import { type Io, UsageError } from "./io";

export interface Source {
  readonly name: string;
  readonly text: string;
}

export const AUTO_ENCODING = "auto";

const WINDOWS_HINT =
  "If it is Windows-1251 (Cyrillic), pass --input-encoding windows-1251";

function decoderFor(label: string): TextDecoder {
  try {
    return new TextDecoder(label);
  } catch {
    throw new UsageError(
      `--input-encoding "${label}" is not an encoding I know: try utf-8, utf-16le or windows-1251`,
    );
  }
}

export function decodeText(
  bytes: Uint8Array,
  name: string,
  encoding: string = AUTO_ENCODING,
): string {
  if (encoding !== AUTO_ENCODING) {
    return decoderFor(encoding).decode(bytes);
  }

  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes);
  }

  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(bytes);
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new UsageError(`${name} is not valid UTF-8. ${WINDOWS_HINT}`);
  }
}

async function readFileOrFail(path: string): Promise<Uint8Array> {
  try {
    return await readFile(path);
  } catch (error) {
    const reason =
      error instanceof Error && "code" in error && error.code === "ENOENT"
        ? "no such file"
        : error instanceof Error
          ? error.message
          : String(error);

    throw new UsageError(`Cannot read ${path}: ${reason}`);
  }
}

export async function readTextFile(path: string): Promise<string> {
  return decodeText(await readFileOrFail(path), path);
}

export async function readSource(
  path: string | undefined,
  io: Io,
  encoding: string = AUTO_ENCODING,
): Promise<Source> {
  if (path !== undefined && path !== "-") {
    return {
      name: path,
      text: decodeText(await readFileOrFail(path), path, encoding),
    };
  }

  if (io.stdinIsTty) {
    throw new UsageError("No input: give a file, or pipe the diagram in");
  }

  return {
    name: "stdin",
    text: decodeText(await io.readStdin(), "stdin", encoding),
  };
}
