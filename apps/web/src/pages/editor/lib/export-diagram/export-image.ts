import { type ExportSettings, exportFileName } from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { downloadBlob } from "@shared/lib/download-blob";

import { renderForExport } from "./render-for-export";
import { renderRaster } from "./render-raster";

export async function exportImage(
  source: string,
  profile: StandardProfile,
  settings: ExportSettings,
): Promise<void> {
  const name = exportFileName(profile.id, settings);

  if (settings.format === "svg") {
    const { svg } = await renderForExport(source, profile, settings);

    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), name);

    return;
  }

  downloadBlob(
    await renderRaster(source, profile, settings, settings.format),
    name,
  );
}
