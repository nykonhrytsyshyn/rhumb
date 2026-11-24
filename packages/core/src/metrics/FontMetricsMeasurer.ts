import {
  ApproximateTextMeasurer,
  type Size,
  type TextMeasurer,
  type TextStyle,
} from "@rhumb/kernel";
import { fontFamilies } from "@rhumb/profiles";

import type { ResolvedFont } from "../fonts";
import { FontMetrics } from "./FontMetrics";

/**
 * Measures text with the real widths of the font files it was given, so block
 * sizes come out as they do in a browser that has the same font. Characters the
 * files lack, and families with no readable file, are estimated.
 */
export class FontMetricsMeasurer implements TextMeasurer {
  private readonly fallback = new ApproximateTextMeasurer();
  private readonly byFamily = new Map<string, FontMetrics>();

  /**
   * @param fonts  the fonts of the drawing.
   * @param decode turns a WOFF or WOFF2 file into bytes the reader can use;
   *               without it only TTF and OTF are read.
   */
  public constructor(
    fonts: readonly ResolvedFont[],
    decode?: (font: ResolvedFont) => Uint8Array | undefined,
  ) {
    for (const font of fonts) {
      const key = font.family.toLowerCase();
      const readable =
        font.format === "truetype" || font.format === "opentype"
          ? font.bytes
          : decode?.(font);
      const metrics =
        readable === undefined ? undefined : FontMetrics.parse(readable);

      if (metrics !== undefined && !this.byFamily.has(key)) {
        this.byFamily.set(key, metrics);
      }
    }
  }

  public measure(text: string, style: TextStyle): Size {
    const stack = fontFamilies(style.family).flatMap(
      (family) => this.byFamily.get(family.toLowerCase()) ?? [],
    );

    if (stack.length === 0) {
      return this.fallback.measure(text, style);
    }

    const lines = text.split("\n");
    const width = lines.reduce(
      (widest, line) => Math.max(widest, this.lineWidth(line, stack, style)),
      0,
    );

    return { width, height: lines.length * style.size * style.lineHeight };
  }

  private lineWidth(
    line: string,
    stack: readonly FontMetrics[],
    style: TextStyle,
  ): number {
    let width = 0;

    for (const char of line) {
      const codePoint = char.codePointAt(0) ?? 0;
      const advance = stack
        .map((metrics) => metrics.advance(codePoint))
        .find((value) => value !== undefined);

      width +=
        advance === undefined
          ? this.fallback.measure(char, style).width
          : advance * style.size;
    }

    return width;
  }
}
