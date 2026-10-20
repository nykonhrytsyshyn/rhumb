import type { StandardProfile } from "@rhumb/profiles";

import { downloadBlob } from "@shared/lib/download-blob";

import type { ExportOptions } from "./export-options";
import { renderPng } from "./render-png";

export async function exportPng(
  source: string,
  profile: StandardProfile,
  options: ExportOptions,
): Promise<void> {
  downloadBlob(await renderPng(source, profile, options), `${profile.id}.png`);
}
