import type { RasterFormat } from "./RasterFormat";

export interface RasterOptions {
  readonly format: RasterFormat;
  readonly quality?: number;
}

export interface Rasterizer {
  rasterize(
    svg: string,
    width: number,
    height: number,
    options: RasterOptions,
  ): Promise<Blob>;
}
