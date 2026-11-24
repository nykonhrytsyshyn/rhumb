import { describe, expect, it } from "vitest";

import type { ResolvedFont } from "../fonts";
import { FontMetrics } from "./FontMetrics";
import { FontMetricsMeasurer } from "./FontMetricsMeasurer";

interface TestFont {
  readonly unitsPerEm?: number;
  readonly glyphs: Readonly<Record<string, number>>;
  readonly format?: 4 | 12;
}

class Writer {
  public readonly bytes: number[] = [];

  public u16(...values: number[]): this {
    for (const value of values) {
      this.bytes.push((value >> 8) & 0xff, value & 0xff);
    }

    return this;
  }

  public u32(...values: number[]): this {
    for (const value of values) {
      this.bytes.push(
        (value >>> 24) & 0xff,
        (value >>> 16) & 0xff,
        (value >>> 8) & 0xff,
        value & 0xff,
      );
    }

    return this;
  }
}

function buildFont({
  unitsPerEm = 1000,
  glyphs,
  format = 4,
}: TestFont): Uint8Array {
  const chars = Object.keys(glyphs).toSorted();
  const advances = [500, ...chars.map((char) => glyphs[char] ?? 0)];

  const head = new Writer();

  for (let index = 0; index < 18; index++) {
    head.bytes.push(0);
  }

  head.u16(unitsPerEm);
  head.bytes.push(...new Array<number>(36).fill(0));

  const hhea = new Writer();

  hhea.bytes.push(...new Array<number>(34).fill(0));
  hhea.u16(advances.length);

  const hmtx = new Writer();

  for (const advance of advances) {
    hmtx.u16(advance, 0);
  }

  const cmap = new Writer()
    .u16(0, 1)
    .u16(3, format === 12 ? 10 : 1)
    .u32(12);

  if (format === 12) {
    cmap.u16(12, 0).u32(16 + chars.length * 12, 0, chars.length);

    chars.forEach((char, index) => {
      const code = char.codePointAt(0) ?? 0;

      cmap.u32(code, code, index + 1);
    });
  } else {
    const count = chars.length + 1;

    cmap.u16(4, 16 + count * 8, 0, count * 2, 0, 0, 0);
    chars.forEach((char) => cmap.u16(char.charCodeAt(0)));
    cmap.u16(0xffff, 0);
    chars.forEach((char) => cmap.u16(char.charCodeAt(0)));
    cmap.u16(0xffff);
    chars.forEach((char, index) => {
      cmap.u16((index + 1 - char.charCodeAt(0)) & 0xffff);
    });
    cmap.u16(1);
    new Array<number>(count).fill(0).forEach(() => cmap.u16(0));
  }

  const tables = [
    ["cmap", cmap.bytes],
    ["head", head.bytes],
    ["hhea", hhea.bytes],
    ["hmtx", hmtx.bytes],
  ] as const;
  const directory = new Writer().u32(0x00010000).u16(tables.length, 0, 0, 0);
  let offset = 12 + tables.length * 16;
  const body: number[] = [];

  for (const [tag, data] of tables) {
    directory.bytes.push(...Array.from(tag, (c) => c.charCodeAt(0)));
    directory.u32(0, offset, data.length);
    body.push(...data);
    offset += data.length;
  }

  return Uint8Array.from([...directory.bytes, ...body]);
}

const style = { family: "'Test Font', Arial", size: 10, lineHeight: 1.5 };

function resolved(bytes: Uint8Array, family = "Test Font"): ResolvedFont {
  return { family, format: "truetype", weight: "400", bytes };
}

describe("FontMetrics", () => {
  it.each([4, 12] as const)(
    "reads advances through a format %i cmap",
    (format) => {
      const metrics = FontMetrics.parse(
        buildFont({ unitsPerEm: 2000, glyphs: { A: 1000, i: 500 }, format }),
      );

      expect(metrics?.advance(65)).toBe(0.5);
      expect(metrics?.advance(105)).toBe(0.25);
    },
  );

  it("knows a character the font lacks", () => {
    const metrics = FontMetrics.parse(buildFont({ glyphs: { A: 600 } }));

    expect(metrics?.advance("Z".charCodeAt(0))).toBeUndefined();
  });

  it("refuses what is not a TTF or OTF", () => {
    expect(
      FontMetrics.parse(Uint8Array.from([0x77, 0x4f, 0x46, 0x32, 0, 0])),
    ).toBeUndefined();
    expect(FontMetrics.parse(new Uint8Array())).toBeUndefined();
    expect(
      FontMetrics.parse(buildFont({ glyphs: { A: 1 } }).slice(0, 40)),
    ).toBeUndefined();
  });
});

describe("FontMetricsMeasurer", () => {
  const font = resolved(buildFont({ glyphs: { A: 800, B: 400, " ": 250 } }));

  it("sums the real advances and takes the widest line", () => {
    const { width, height } = new FontMetricsMeasurer([font]).measure(
      "AB\nA A",
      style,
    );

    // "AB" = 12 px, "A A" = 8 + 2.5 + 8 = 18.5 px
    expect(width).toBeCloseTo(18.5);
    expect(height).toBe(2 * 10 * 1.5);
  });

  it("estimates characters the font lacks", () => {
    const { width } = new FontMetricsMeasurer([font]).measure("AZ", style);

    expect(width).toBeCloseTo(8 + 10 * 0.6);
  });

  it("estimates the whole text when no font of the stack is known", () => {
    const measurer = new FontMetricsMeasurer([font]);

    expect(
      measurer.measure("AB", { ...style, family: "Arial" }).width,
    ).toBeCloseTo(12);
    expect(new FontMetricsMeasurer([]).measure("AB", style).width).toBeCloseTo(
      12,
    );
  });

  it("does not read WOFF2, and estimates instead", () => {
    const woff2: ResolvedFont = { ...font, format: "woff2" };

    expect(
      new FontMetricsMeasurer([woff2]).measure("A", style).width,
    ).toBeCloseTo(6);
  });

  it("matches the family name without regard to case", () => {
    const lower = resolved(font.bytes, "test font");

    expect(
      new FontMetricsMeasurer([lower]).measure("A", style).width,
    ).toBeCloseTo(8);
  });
});
