import {
  CanvasRasterizer,
  RasterExporter,
  type RasterFormat,
} from "@rhumb/export";
import type { ExportSettings } from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { renderForExport } from "./render-for-export";

const JPEG_MATTE = "#ffffff";

export async function renderRaster(
  source: string,
  profile: StandardProfile,
  settings: ExportSettings,
  format: RasterFormat,
): Promise<Blob> {
  const { svg, size } = await renderForExport(source, profile, settings);
  const matte =
    format === "jpeg"
      ? settings.transparent
        ? JPEG_MATTE
        : settings.background
      : null;

  return new RasterExporter(new CanvasRasterizer(matte)).export(
    svg,
    size,
    settings.scale,
    { format, quality: settings.quality / 100 },
  );
}
