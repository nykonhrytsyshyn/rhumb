import type { RenderOptions } from "@nykon/rhumb";

import type { ExportSettings } from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { loadEmbeddedFonts } from "./load-embedded-fonts";

export async function toRenderOptions(
  profile: StandardProfile,
  settings: ExportSettings,
): Promise<RenderOptions> {
  return { ...settings, profile, fonts: await loadEmbeddedFonts(profile) };
}
