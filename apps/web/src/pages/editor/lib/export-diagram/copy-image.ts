import type { ExportSettings } from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { renderRaster } from "./render-raster";

/** Puts the picture on the clipboard, which only accepts PNG images. */
export async function copyImage(
  source: string,
  profile: StandardProfile,
  settings: ExportSettings,
): Promise<void> {
  const blob = await renderRaster(source, profile, settings, "png");

  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}
