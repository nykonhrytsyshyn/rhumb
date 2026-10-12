import type { Size } from "@rhumb/kernel";

import type { Rasterizer } from "./Rasterizer";

export class PngExporter {
  public constructor(private readonly rasterizer: Rasterizer) {}

  /**
   * Exports an SVG to a PNG image.
   *
   * @param svg   The SVG string to export.
   * @param size  The size of the SVG.
   * @param scale Pixel density multiplier relative to the SVG size.
   * @returns A promise that resolves to a Blob containing the PNG image data.
   */
  public export(svg: string, size: Size, scale = 2): Promise<Blob> {
    return this.rasterizer.rasterize(
      svg,
      Math.round(size.width * scale),
      Math.round(size.height * scale),
    );
  }
}
