import type { FontSource } from "@nykon/rhumb";

import { fontFamilies } from "@rhumb/profiles";
import type { StandardProfile } from "@rhumb/profiles";

import { FONT_FILES, type FontFile } from "@shared/lib/font-files";

const cache = new Map<string, Promise<FontSource | undefined>>();

async function fetchFont(font: FontFile): Promise<FontSource | undefined> {
  try {
    const response = await fetch(font.url);

    if (!response.ok) {
      return undefined;
    }

    return {
      family: font.family,
      data: new Uint8Array(await response.arrayBuffer()),
      format: font.format,
      weight: font.weight,
    };
  } catch {
    return undefined;
  }
}

function load(font: FontFile): Promise<FontSource | undefined> {
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

export async function loadEmbeddedFonts(
  profile: StandardProfile,
): Promise<readonly FontSource[]> {
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
