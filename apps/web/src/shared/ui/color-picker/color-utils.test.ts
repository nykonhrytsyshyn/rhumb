import { describe, expect, it } from "vitest";

import {
  formatHsv,
  hslToHsv,
  hsvToHsl,
  normalizeHexColor,
  parseColorToHsv,
} from "./color-utils";

describe("color-utils", () => {
  it("converts between HSV and HSL without drift on corners", () => {
    expect(hsvToHsl(0, 100, 100)).toEqual([0, 100, 50]);
    expect(hslToHsv(0, 100, 50)).toEqual([0, 100, 100]);
    expect(hsvToHsl(120, 0, 100)).toEqual([120, 0, 100]);
    expect(hslToHsv(120, 0, 100)).toEqual([120, 0, 100]);
    expect(hsvToHsl(240, 0, 0)).toEqual([240, 0, 0]);
    expect(hslToHsv(240, 0, 0)).toEqual([240, 0, 0]);
  });

  it("parses valid CSS colors and returns null for invalid ones", () => {
    expect(parseColorToHsv("#ff0000")).toEqual({
      hue: 0,
      saturation: 100,
      brightness: 100,
      alpha: 100,
    });
    expect(parseColorToHsv("#1e3a8a")?.hue).toBeCloseTo(224, 0);
    expect(parseColorToHsv("#00000080")?.alpha).toBe(50);
    expect(parseColorToHsv("not-a-color")).toBeNull();
  });

  it("formats hex, rgb, hsl and optional alpha", () => {
    const formatted = formatHsv(
      { hue: 240, saturation: 50, brightness: 100, alpha: 50 },
      true,
    );

    expect(formatted.hex).toBe("#8080ff");
    expect(formatted.output).toBe("#8080ff80");
    expect(formatted.rgb).toEqual([128, 128, 255]);
    expect(formatted.hsl).toEqual([240, 100, 75]);
    expect(
      formatHsv({ hue: 240, saturation: 50, brightness: 100, alpha: 50 }, false)
        .output,
    ).toBe("#8080ff");
  });

  it("normalizes short and unprefixed hex strings", () => {
    expect(normalizeHexColor("#ABC")).toBe("#aabbcc");
    expect(normalizeHexColor("1e3a8a")).toBe("#1e3a8a");
    expect(normalizeHexColor("xyz")).toBeNull();
  });
});
