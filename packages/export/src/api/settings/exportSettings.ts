export const EXPORT_FORMATS = ["png", "svg", "jpeg", "webp"] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const EXPORT_SCALES = [1, 2, 3, 4] as const;

export type ExportScale = (typeof EXPORT_SCALES)[number];

export interface ExportRange {
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

export const PADDING_RANGE: ExportRange = { min: 0, max: 96, step: 4 };
export const RADIUS_RANGE: ExportRange = { min: 0, max: 48, step: 2 };
export const QUALITY_RANGE: ExportRange = { min: 50, max: 100, step: 1 };

/** Everything the person can tune about an exported image. */
export interface ExportSettings {
  readonly format: ExportFormat;
  /** Pixel density of raster images relative to the drawing. */
  readonly scale: ExportScale;
  /** Encoder quality in percent; only JPEG and WebP use it. */
  readonly quality: number;
  /** Colour of lines and text. */
  readonly ink: string;
  /** Colour of blocks. */
  readonly fill: string;
  /** Leaves blocks see-through instead of filling them. */
  readonly hollow: boolean;
  /** Colour of the page behind the drawing. */
  readonly background: string;
  /** Drops the page so only the drawing remains. */
  readonly transparent: boolean;
  /** Free space around the drawing, in pixels. */
  readonly padding: number;
  /** Corner radius of the page, in pixels. */
  readonly radius: number;
  /** Name of the file without extension; empty follows the standard. */
  readonly fileName: string;
}
