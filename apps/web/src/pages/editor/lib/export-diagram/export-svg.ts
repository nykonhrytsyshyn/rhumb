import type { StandardProfile } from "@rhumb/profiles";

import { downloadBlob } from "@shared/lib/download-blob";

import type { ExportOptions } from "./export-options";
import { renderForExport } from "./render-for-export";

export async function exportSvg(
  source: string,
  profile: StandardProfile,
  options: ExportOptions,
): Promise<void> {
  const { svg } = await renderForExport(source, profile, options);

  downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${profile.id}.svg`);
}
