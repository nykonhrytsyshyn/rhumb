import { type Rect, type SvgNode, roundTo, svgNode } from "@rhumb/kernel";

/** A point as an `[x, y]` pair, the form the shape outlines are written in. */
export type Pair = readonly [number, number];

function text(value: number): string {
  return String(roundTo(value));
}

/** Corners of a closed outline, as an SVG polygon. */
export function polygon(corners: readonly Pair[]): SvgNode {
  return svgNode("polygon", {
    points: corners.map(([x, y]) => `${text(x)},${text(y)}`).join(" "),
  });
}

/** A path from drawing commands, with numbers rounded to keep it compact. */
export function path(...commands: readonly (string | number)[]): SvgNode {
  return svgNode("path", {
    d: commands
      .map((part) => (typeof part === "number" ? text(part) : part))
      .join(" "),
  });
}

export function line(x1: number, y1: number, x2: number, y2: number): SvgNode {
  return svgNode("line", {
    x1: roundTo(x1),
    y1: roundTo(y1),
    x2: roundTo(x2),
    y2: roundTo(y2),
  });
}

export function right(bounds: Rect): number {
  return bounds.x + bounds.width;
}

export function bottom(bounds: Rect): number {
  return bounds.y + bounds.height;
}

/** An outline that is not closed, so it is never filled. */
export function openPath(...commands: readonly (string | number)[]): SvgNode {
  const drawn = path(...commands);

  return svgNode("path", { ...drawn.attrs, fill: "none" });
}
