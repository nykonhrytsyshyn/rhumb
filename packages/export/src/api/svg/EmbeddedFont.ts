export type EmbeddedFontFormat = "woff2" | "woff" | "truetype";

export interface EmbeddedFont {
  /** The name the drawing uses for the font, as in `font-family`. */
  readonly family: string;
  /** The font file, base64-encoded. */
  readonly data: string;
  readonly format: EmbeddedFontFormat;
  /** `font-weight` of the face: a number or a range such as "100 900". */
  readonly weight: string;
}
