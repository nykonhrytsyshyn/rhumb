import { type EmbeddedFont, toBase64 } from "@rhumb/export";
import { type StandardProfile, fontFamilies } from "@rhumb/profiles";

import type { FontFormat, FontSource } from "./types";

/** A font whose bytes are known and whose format has been settled. */
export interface ResolvedFont {
  readonly family: string;
  readonly format: FontFormat;
  readonly weight: string;
  readonly bytes: Uint8Array;
}

const DEFAULT_WEIGHT = "400";

function startsWith(bytes: Uint8Array, text: string): boolean {
  for (let index = 0; index < text.length; index++) {
    if (bytes[index] !== text.charCodeAt(index)) {
      return false;
    }
  }

  return true;
}

/** Tells the format of a font file from its first bytes. */
export function detectFontFormat(bytes: Uint8Array): FontFormat | undefined {
  if (startsWith(bytes, "wOF2")) {
    return "woff2";
  }

  if (startsWith(bytes, "wOFF")) {
    return "woff";
  }

  if (startsWith(bytes, "OTTO")) {
    return "opentype";
  }

  const isTrueType =
    startsWith(bytes, "true") ||
    (bytes[0] === 0 && bytes[1] === 1 && bytes[2] === 0 && bytes[3] === 0);

  return isTrueType ? "truetype" : undefined;
}

function toBytes(data: Uint8Array | string): Uint8Array {
  if (typeof data !== "string") {
    return data;
  }

  const binary = atob(data);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

const resolved = new WeakMap<FontSource, ResolvedFont>();

/**
 * @throws Error when the format is not given and cannot be told from the file.
 */
export function resolveFont(font: FontSource): ResolvedFont {
  const cached = resolved.get(font);

  if (cached !== undefined) {
    return cached;
  }

  const bytes = toBytes(font.data);
  const format = font.format ?? detectFontFormat(bytes);

  if (format === undefined) {
    throw new Error(
      `Font "${font.family}" is not a WOFF2, WOFF, TrueType or OpenType file`,
    );
  }

  const result: ResolvedFont = {
    family: font.family,
    format,
    weight: font.weight ?? DEFAULT_WEIGHT,
    bytes,
  };

  resolved.set(font, result);

  return result;
}

/** The fonts that the profile's font stack names, one per family. */
export function fontsForProfile(
  fonts: readonly FontSource[],
  profile: StandardProfile,
): readonly ResolvedFont[] {
  const wanted = new Set(
    fontFamilies(profile.font.family).map((family) => family.toLowerCase()),
  );
  const matched = new Map<string, ResolvedFont>();

  for (const font of fonts) {
    const key = font.family.toLowerCase();

    if (wanted.has(key) && !matched.has(key)) {
      matched.set(key, resolveFont(font));
    }
  }

  return [...matched.values()];
}

export function toEmbeddedFont(font: ResolvedFont): EmbeddedFont {
  return {
    family: font.family,
    data: toBase64(font.bytes),
    format: font.format,
    weight: font.weight,
  };
}
