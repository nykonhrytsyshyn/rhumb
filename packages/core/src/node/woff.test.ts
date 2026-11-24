import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { ResolvedFont } from "../fonts";
import { FontMetrics } from "../metrics/FontMetrics";
import { decodeWebFont } from "./woff";

const FONTS = resolve(
  import.meta.dirname,
  "../../../../apps/web/src/shared/assets/fonts",
);

function load(name: string): ResolvedFont {
  return {
    family: name,
    format: "woff2",
    weight: "400",
    bytes: readFileSync(resolve(FONTS, name)),
  };
}

describe("decodeWebFont", () => {
  it.each([
    "OpenGost-Type-A.woff2",
    "OpenGost-Type-B.woff2",
    "Inter-Variable.woff2",
  ])("gives measurable tables from %s", (name) => {
    const decoded = decodeWebFont(load(name));
    const metrics =
      decoded === undefined ? undefined : FontMetrics.parse(decoded);

    expect(metrics).toBeDefined();
    // A Latin capital and a Cyrillic one, both present in every font used here
    expect(metrics?.advance("H".charCodeAt(0))).toBeGreaterThan(0.3);
    expect(metrics?.advance("Ж".charCodeAt(0)) ?? 1).toBeGreaterThan(0);
  });

  it("gives the same widths as fontTools does for the file", () => {
    // Measured once with fontTools (sum of advances in em) for this text
    const text = "Початок: x > 0? Привіт, світе! ЖЯЩ Hello 123";
    const decoded = decodeWebFont(load("OpenGost-Type-A.woff2"));
    const metrics = FontMetrics.parse(decoded ?? new Uint8Array());
    const sum = Array.from(text).reduce(
      (total, char) =>
        total + (metrics?.advance(char.codePointAt(0) ?? 0) ?? 0),
      0,
    );

    expect(sum).toBeCloseTo(14.48095703125, 6);
  });

  it("returns undefined for other formats and for broken files", () => {
    expect(
      decodeWebFont({ ...load("OpenGost-Type-A.woff2"), format: "truetype" }),
    ).toBeUndefined();
    expect(
      decodeWebFont({
        ...load("OpenGost-Type-A.woff2"),
        bytes: new Uint8Array(60),
      }),
    ).toBeUndefined();
  });
});
