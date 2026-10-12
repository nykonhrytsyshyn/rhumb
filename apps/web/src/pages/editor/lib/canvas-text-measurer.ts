import {
  ApproximateTextMeasurer,
  type Size,
  type TextMeasurer,
  type TextStyle,
} from "@rhumb/kernel";

type MeasureContext = Pick<CanvasRenderingContext2D, "font" | "measureText">;

function createBrowserContext(): MeasureContext | null {
  return document.createElement("canvas").getContext("2d");
}

/** Measures text with the browser's own font metrics. */
export class CanvasTextMeasurer implements TextMeasurer {
  private readonly fallback = new ApproximateTextMeasurer();
  private readonly createContext: () => MeasureContext | null;
  private context: MeasureContext | null | undefined;

  public constructor(
    createContext: () => MeasureContext | null = createBrowserContext,
  ) {
    this.createContext = createContext;
  }

  public measure(text: string, style: TextStyle): Size {
    this.context ??= this.createContext();
    const context = this.context;

    if (context === null) {
      return this.fallback.measure(text, style);
    }

    context.font = `${String(style.size)}px ${style.family}`;
    const lines = text.split("\n");
    const width = lines.reduce(
      (max, line) => Math.max(max, context.measureText(line).width),
      0,
    );

    return { width, height: lines.length * style.size * style.lineHeight };
  }
}
