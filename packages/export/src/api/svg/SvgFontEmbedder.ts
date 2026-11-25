import type { EmbeddedFont, EmbeddedFontFormat } from "./EmbeddedFont";
import { escapeText } from "./escapeText";

const OPENING_TAG = /^<svg\b[^>]*>/;

const MIME_TYPES: Readonly<Record<EmbeddedFontFormat, string>> = {
  woff2: "font/woff2",
  woff: "font/woff",
  truetype: "font/ttf",
  opentype: "font/otf",
};

/**
 * Puts font files into an SVG document, so that the text keeps its typeface
 * wherever the picture is opened or turned into pixels: a font that is only
 * installed on this device, or only loaded by this page, is not available to a
 * standalone SVG or to an SVG drawn as an image.
 */
export class SvgFontEmbedder {
  /**
   * @returns `svg` with one `@font-face` rule per font, each family once.
   * @throws Error when `svg` is not a serialized SVG document.
   */
  public embed(svg: string, fonts: readonly EmbeddedFont[]): string {
    const unique = fonts.filter(
      (font, index) =>
        fonts.findIndex((other) => other.family === font.family) === index,
    );

    if (unique.length === 0) {
      return svg;
    }

    const opening = OPENING_TAG.exec(svg)?.[0];

    if (opening === undefined) {
      throw new Error("Expected a serialized SVG document");
    }

    const defs = `<defs><style>${escapeText(unique.map((font) => SvgFontEmbedder.rule(font)).join(""))}</style></defs>`;
    const rest = svg.slice(opening.length);

    if (opening.endsWith("/>")) {
      // An empty drawing: `<svg .../>` has to be opened to hold the styles
      return `${opening.slice(0, -2)}>${defs}</svg>${rest}`;
    }

    return `${opening}${defs}${rest}`;
  }

  private static rule(font: EmbeddedFont): string {
    const family = font.family.replace(/[\\']/g, "\\$&");

    return (
      `@font-face{font-family:'${family}';` +
      `src:url(data:${MIME_TYPES[font.format]};base64,${font.data}) format('${font.format}');` +
      `font-weight:${font.weight};font-style:normal;}`
    );
  }
}
