import { describe, expect, it } from "vitest";

import { SvgFrame } from "./SvgFrame";

const DRAWING =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 100 50"><g/></svg>';
const SIZE = { width: 100, height: 50 };

describe("SvgFrame", () => {
  it("returns the drawing untouched when there is nothing to add", () => {
    const framed = new SvgFrame().wrap(DRAWING, SIZE, {
      padding: 0,
      background: null,
      radius: 8,
    });

    expect(framed).toEqual({ svg: DRAWING, size: SIZE });
  });

  it("grows the page by the padding on every side", () => {
    const framed = new SvgFrame().wrap(DRAWING, SIZE, {
      padding: 10,
      background: null,
      radius: 0,
    });

    expect(framed.size).toEqual({ width: 120, height: 70 });
    expect(framed.svg).toContain('viewBox="0 0 120 70"');
    expect(framed.svg).toContain('<svg x="10" y="10" xmlns=');
    expect(framed.svg).not.toContain("<rect");
  });

  it("paints the page colour and rounds its corners", () => {
    const framed = new SvgFrame().wrap(DRAWING, SIZE, {
      padding: 0,
      background: "#112233",
      radius: 12,
    });

    expect(framed.size).toEqual(SIZE);
    expect(framed.svg).toContain(
      '<rect width="100" height="50" rx="12" ry="12" fill="#112233"/>',
    );
  });

  it("never rounds a corner past half of the shorter side", () => {
    const framed = new SvgFrame().wrap(DRAWING, SIZE, {
      padding: 0,
      background: "#ffffff",
      radius: 500,
    });

    expect(framed.svg).toContain('rx="25"');
  });

  it("escapes the page colour", () => {
    const framed = new SvgFrame().wrap(DRAWING, SIZE, {
      padding: 0,
      background: 'red" onload="x',
      radius: 0,
    });

    expect(framed.svg).toContain('fill="red&quot; onload=&quot;x"');
  });

  it("rejects input that is not an SVG document", () => {
    expect(() =>
      new SvgFrame().wrap("<div/>", SIZE, {
        padding: 4,
        background: null,
        radius: 0,
      }),
    ).toThrow("SVG");
  });
});
