import { PRINT_APPEARANCE } from "@rhumb/engine";
import { CanvasRasterizer, PngExporter } from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import type { ExportOptions } from "./export-options";
import { renderForExport } from "./render-for-export";

const PNG_SCALE = 2;

export async function renderPng(
  source: string,
  profile: StandardProfile,
  options: ExportOptions,
): Promise<Blob> {
  const { svg, size } = await renderForExport(source, profile, options);
  const rasterizer = new CanvasRasterizer(
    options.transparent ? null : PRINT_APPEARANCE.background,
  );

  return new PngExporter(rasterizer).export(svg, size, PNG_SCALE);
}
