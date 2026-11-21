import type { Size } from "@rhumb/kernel";

import type { RasterOptions, Rasterizer } from "./Rasterizer";

export class RasterExporter {
  public constructor(private readonly rasterizer: Rasterizer) {}

  /**
   * Exports an SVG to a raster image.
   *
   * @param svg     The SVG string to export.
   * @param size    The size of the SVG.
   * @param scale   Pixel density multiplier relative to the SVG size.
   * @param options Image format and, for lossy formats, quality.
   * @returns A promise that resolves to a Blob containing the image data.
   */
  public export(
    svg: string,
    size: Size,
    scale = 2,
    options: RasterOptions = { format: "png" },
  ): Promise<Blob> {
    return this.rasterizer.rasterize(
      svg,
      Math.round(size.width * scale),
      Math.round(size.height * scale),
      options,
    );
  }
}
