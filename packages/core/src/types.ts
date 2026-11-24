import type {
  EmbeddedFontFormat,
  ExportPresetId,
  ExportSettings,
  RasterFormat,
} from "@rhumb/export";
import type { Size } from "@rhumb/kernel";
import type { StandardProfile } from "@rhumb/profiles";

/** The look of a drawing; every field is optional and has a default. */
export type StyleOptions = Partial<
  Pick<
    ExportSettings,
    | "ink"
    | "fill"
    | "hollow"
    | "background"
    | "transparent"
    | "padding"
    | "radius"
  >
>;

export type FontFormat = EmbeddedFontFormat;

/**
 * A font file to draw the text with. Fonts are matched to a profile by the
 * names in its font stack, so `family` has to be one of them.
 */
export interface FontSource {
  /** The name the profile's font stack uses, e.g. `OpenGost Type A`. */
  readonly family: string;
  /** The file's bytes, or the same bytes as base64. */
  readonly data: Uint8Array | string;
  /** Read from the file when left out; a base64 string is decoded for it. */
  readonly format?: FontFormat;
  /** `font-weight` of the face, a number or a range such as "100 900". */
  readonly weight?: string;
}

export interface RenderOptions extends StyleOptions {
  /** A profile or the id of a registered one; the default profile when left out. */
  readonly profile?: string | StandardProfile;
  /** Colours to start from; individual colour options win over it. */
  readonly preset?: ExportPresetId;
  /** Backdrop of labels that sit on lines; follows the page by default. */
  readonly labelBackground?: string;
  /** Pixels per millimetre of the profile (4 by default). */
  readonly pixelsPerMm?: number;
  /** Fonts for this drawing, besides the ones the renderer was created with. */
  readonly fonts?: readonly FontSource[];
}

export interface RenderResult {
  readonly svg: string;
  /** Size of the whole drawing, padding included. */
  readonly size: Size;
  readonly profile: StandardProfile;
}

export interface ImageOptions extends RenderOptions {
  /** PNG by default. */
  readonly format?: RasterFormat;
  /** Pixel density relative to the drawing: 1, 2, 3 or 4 (2 by default). */
  readonly scale?: ExportSettings["scale"];
  /** Percent, for JPEG and WebP (92 by default). */
  readonly quality?: number;
}

export interface ImageResult {
  readonly blob: Blob;
  readonly format: RasterFormat;
  readonly mime: string;
  /** Size in pixels. */
  readonly width: number;
  readonly height: number;
  /** The encoded image as bytes, for writing to a file or a response. */
  bytes(): Promise<Uint8Array>;
}

export type CheckResult =
  | { readonly ok: true; readonly nodes: number; readonly edges: number }
  | {
      readonly ok: false;
      /** One-based line of the source the problem is on. */
      readonly line: number;
      readonly message: string;
    };
