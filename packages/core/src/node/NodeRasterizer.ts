import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { Resvg as ResvgClass } from "@resvg/resvg-js";

import type { RasterOptions, Rasterizer } from "@rhumb/export";

import type { ResolvedFont } from "../fonts";
import { loadOptional } from "./loadOptional";

interface ResvgModule {
  readonly Resvg: typeof ResvgClass;
}

interface SharpModule {
  readonly default: (input: Uint8Array) => {
    jpeg(options: { quality: number }): { toBuffer(): Promise<Uint8Array> };
    webp(options: { quality: number }): { toBuffer(): Promise<Uint8Array> };
  };
}

const FONT_EXTENSIONS: Readonly<Record<ResolvedFont["format"], string>> = {
  truetype: "ttf",
  opentype: "otf",
  woff: "woff",
  woff2: "woff2",
};

/**
 * resvg reads fonts from files only, so a font that exists as bytes is put in
 * a temporary folder once, under a name made from its content.
 */
function fontFile(font: ResolvedFont): string {
  if (font.format === "woff" || font.format === "woff2") {
    throw new Error(
      `Font "${font.family}" is a ${font.format.toUpperCase()} file, which ` +
        "images cannot be drawn with in Node.js: use a TTF or OTF file",
    );
  }

  const folder = join(tmpdir(), "rhumb-fonts");
  const hash = createHash("sha256").update(font.bytes).digest("hex");
  const file = join(
    folder,
    `${hash.slice(0, 16)}.${FONT_EXTENSIONS[font.format]}`,
  );

  mkdirSync(folder, { recursive: true });
  writeFileSync(file, font.bytes);

  return file;
}

/**
 * Draws SVG with resvg, no browser needed. PNG comes straight from it; JPEG
 * and WebP are encoded from that PNG with sharp.
 */
export class NodeRasterizer implements Rasterizer {
  private readonly matte: string | null;
  private readonly fonts: readonly ResolvedFont[];

  /**
   * @param matte colour painted under the drawing, or null to keep alpha.
   * @param fonts fonts to draw the text with, besides the system's.
   */
  public constructor(
    matte: string | null = null,
    fonts: readonly ResolvedFont[] = [],
  ) {
    this.matte = matte;
    this.fonts = fonts;
  }

  public async rasterize(
    svg: string,
    width: number,
    _height: number,
    { format, quality = 0.92 }: RasterOptions,
  ): Promise<Blob> {
    const { Resvg } = await loadOptional<ResvgModule>(
      "@resvg/resvg-js",
      "Drawing images",
    );
    const png = new Resvg(svg, {
      fitTo: { mode: "width", value: width },
      font: {
        loadSystemFonts: true,
        fontFiles: this.fonts.map(fontFile),
      },
      ...(this.matte === null ? {} : { background: this.matte }),
    })
      .render()
      .asPng();

    if (format === "png") {
      return new Blob([new Uint8Array(png)], { type: "image/png" });
    }

    const { default: sharp } = await loadOptional<SharpModule>(
      "sharp",
      `Encoding ${format.toUpperCase()}`,
    );
    const percent = Math.round(quality * 100);
    const pipeline = sharp(png);
    const encoded =
      format === "jpeg"
        ? await pipeline.jpeg({ quality: percent }).toBuffer()
        : await pipeline.webp({ quality: percent }).toBuffer();

    return new Blob([new Uint8Array(encoded)], { type: `image/${format}` });
  }
}
