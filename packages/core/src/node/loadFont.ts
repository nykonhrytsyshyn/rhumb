import { readFile } from "node:fs/promises";

import type { FontFormat, FontSource } from "../types";

export interface LoadFontOptions {
  /** `font-weight` of the face; "400" when left out. */
  readonly weight?: string;
  /** Read from the file when left out. */
  readonly format?: FontFormat;
}

/**
 * Reads a font file for use as a `fonts` option.
 *
 * @param family  The name the profile's font stack uses, e.g. `OpenGost Type A`.
 * @param path    Where the file is.
 * @param options Optional metadata about the font face.
 */
export async function loadFont(
  family: string,
  path: string,
  options: LoadFontOptions = {},
): Promise<FontSource> {
  return { family, data: await readFile(path), ...options };
}
