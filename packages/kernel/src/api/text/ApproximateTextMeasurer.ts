import type { Size } from "../model";
import type { TextMeasurer, TextStyle } from "./TextMeasurer";

/** DOM-free estimate based on an average glyph width. */
export class ApproximateTextMeasurer implements TextMeasurer {
  public constructor(private readonly glyphWidthRatio = 0.6) {}

  public measure(text: string, style: TextStyle): Size {
    const lines = text.split("\n");
    const longest = lines.reduce((max, line) => Math.max(max, line.length), 0);

    return {
      width: longest * style.size * this.glyphWidthRatio,
      height: lines.length * style.size * style.lineHeight,
    };
  }
}
