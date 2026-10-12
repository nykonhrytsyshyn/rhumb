export interface Rasterizer {
  /** Renders SVG markup into a PNG blob of the given pixel size. */
  rasterize(svg: string, width: number, height: number): Promise<Blob>;
}
