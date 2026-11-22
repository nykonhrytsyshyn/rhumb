import type { EmbeddedFont } from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { FONT_FILES, type FontFile } from "@shared/lib/font-files";

import { fontFamilies } from "../font-families";
import { toBase64 } from "./to-base64";

const cache = new Map<string, Promise<EmbeddedFont | undefined>>();

async function fetchFont(font: FontFile): Promise<EmbeddedFont | undefined> {
  try {
    const response = await fetch(font.url);

    if (!response.ok) {
      return undefined;
    }

    return {
      family: font.family,
      data: toBase64(new Uint8Array(await response.arrayBuffer())),
      format: font.format,
      weight: font.weight,
    };
  } catch {
    // Without the file the export is drawn with the fallback font instead
    return undefined;
  }
}

function load(font: FontFile): Promise<EmbeddedFont | undefined> {
  const cached = cache.get(font.family);

  if (cached !== undefined) {
    return cached;
  }

  const loading = fetchFont(font);

  cache.set(font.family, loading);

  void loading.then((loaded) => {
    if (loaded === undefined) {
      cache.delete(font.family);
    }
  });

  return loading;
}

/** The files of the site fonts that the profile's font stack asks for. */
export async function loadEmbeddedFonts(
  profile: StandardProfile,
): Promise<readonly EmbeddedFont[]> {
  const wanted = new Set(
    fontFamilies(profile.font.family).map((family) => family.toLowerCase()),
  );
  const loaded = await Promise.all(
    FONT_FILES.filter((font) => wanted.has(font.family.toLowerCase())).map(
      load,
    ),
  );

  return loaded.filter((font) => font !== undefined);
}
