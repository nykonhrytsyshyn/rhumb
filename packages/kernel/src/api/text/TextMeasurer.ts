import type { Size } from "../model";

export interface TextStyle {
  readonly family: string;
  readonly size: number;
  readonly lineHeight: number;
}

export interface TextMeasurer {
  /** Size of a block of text; lines are separated by "\n". */
  measure(text: string, style: TextStyle): Size;
}
