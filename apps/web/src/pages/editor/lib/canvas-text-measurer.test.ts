import { describe, expect, it } from "vitest";

import { CanvasTextMeasurer } from "./canvas-text-measurer";

const style = { family: "Arial", size: 10, lineHeight: 1.5 };

describe("CanvasTextMeasurer", () => {
  it("uses the widest line reported by the canvas", () => {
    const measurer = new CanvasTextMeasurer(() => ({
      font: "",
      measureText: (text: string) =>
        ({ width: text.length * 7 }) as TextMetrics,
    }));

    expect(measurer.measure("ab\nabcd", style)).toEqual({
      width: 28,
      height: 30,
    });
  });

  it("sets the font from the style", () => {
    const context = {
      font: "",
      measureText: () => ({ width: 1 }) as TextMetrics,
    };

    new CanvasTextMeasurer(() => context).measure("a", style);
    expect(context.font).toBe("10px Arial");
  });

  it("falls back to an estimate without a canvas context", () => {
    const size = new CanvasTextMeasurer(() => null).measure("abcd", style);

    expect(size.width).toBeCloseTo(24);
    expect(size.height).toBe(15);
  });
});
