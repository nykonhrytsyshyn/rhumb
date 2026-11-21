import type { Size } from "@rhumb/kernel";

import type { ExportSettings } from "./exportSettings";

/** Largest canvas side and area that browsers reliably encode. */
export const MAX_RASTER_SIDE = 16_384;
export const MAX_RASTER_AREA = 100_000_000;

/** Size of the finished image: raster formats are scaled, SVG is not. */
export function exportDimensions(
  size: Size,
  { format, scale, padding }: ExportSettings,
): Size {
  const width = size.width + padding * 2;
  const height = size.height + padding * 2;
  const factor = format === "svg" ? 1 : scale;

  return {
    width: Math.round(width * factor),
    height: Math.round(height * factor),
  };
}

export function exceedsRasterLimit(
  size: Size,
  settings: ExportSettings,
): boolean {
  if (settings.format === "svg") {
    return false;
  }

  const { width, height } = exportDimensions(size, settings);

  return (
    width > MAX_RASTER_SIDE ||
    height > MAX_RASTER_SIDE ||
    width * height > MAX_RASTER_AREA
  );
}
