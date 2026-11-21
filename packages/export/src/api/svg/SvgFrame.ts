import type { Size } from "@rhumb/kernel";

import { escapeText } from "./escapeText";

export interface SvgFrameOptions {
  /** Free space added around the drawing, in SVG units. */
  readonly padding: number;
  /** Page colour, or null to keep the page see-through. */
  readonly background: string | null;
  /** Corner radius of the page; it only shows with a background. */
  readonly radius: number;
}

export interface FramedSvg {
  readonly svg: string;
  readonly size: Size;
}

const OPENING_TAG = /^<svg\b/;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Puts a finished drawing on a page of its own: adds room around it and
 * paints the page colour, optionally with rounded corners.
 */
export class SvgFrame {
  /** @throws Error when `svg` is not a serialized SVG document. */
  public wrap(svg: string, size: Size, options: SvgFrameOptions): FramedSvg {
    const padding = Math.max(0, options.padding);

    if (padding === 0 && options.background === null) {
      return { svg, size };
    }

    if (!OPENING_TAG.test(svg)) {
      throw new Error("Expected a serialized SVG document");
    }

    const width = round(size.width + padding * 2);
    const height = round(size.height + padding * 2);
    const offset = String(round(padding));
    const inner = svg.replace(OPENING_TAG, `<svg x="${offset}" y="${offset}"`);

    return {
      svg:
        `<svg xmlns="http://www.w3.org/2000/svg" width="${String(width)}" ` +
        `height="${String(height)}" viewBox="0 0 ${String(width)} ${String(height)}">` +
        `${SvgFrame.page(width, height, options)}${inner}</svg>`,
      size: { width, height },
    };
  }

  private static page(
    width: number,
    height: number,
    { background, radius }: SvgFrameOptions,
  ): string {
    if (background === null) {
      return "";
    }

    const corner = round(Math.min(Math.max(0, radius), width / 2, height / 2));
    const rounding =
      corner === 0 ? "" : ` rx="${String(corner)}" ry="${String(corner)}"`;

    return `<rect width="${String(width)}" height="${String(height)}"${rounding} fill="${escapeText(background)}"/>`;
  }
}
