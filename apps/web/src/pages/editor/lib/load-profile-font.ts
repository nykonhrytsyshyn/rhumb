import type { StandardProfile } from "@rhumb/profiles";

/**
 * Web fonts are fetched lazily, while the canvas measures text at once with
 * whatever is loaded at that moment. Waiting for the profile's font first
 * keeps the block sizes from being computed against a fallback font.
 */
export async function loadProfileFont(profile: StandardProfile): Promise<void> {
  const fonts = (document as Partial<Document>).fonts;

  if (fonts === undefined) {
    return;
  }

  try {
    await fonts.load(`16px ${profile.font.family}`);
  } catch {
    // A stack that cannot be parsed or a file that fails to download only
    // means that the fallback font is measured instead
  }
}
