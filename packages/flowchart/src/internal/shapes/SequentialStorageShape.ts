import {
  type Point,
  type Port,
  type Rect,
  Shape,
  Side,
  type Size,
  type SvgNode,
  roundTo,
  svgNode,
} from "@rhumb/kernel";

import { line } from "./geometry";

/**
 * Circle with a short tail along its bottom: a magnetic tape or a cassette.
 * Lines meet the circle at its vertices; the tail is only decoration.
 */
export class SequentialStorageShape extends Shape {
  private static readonly TAIL_RATIO = 0.25;

  public override measure(text: Size): Size {
    const diameter = Math.max(text.width, text.height);

    return {
      width: diameter * (1 + SequentialStorageShape.TAIL_RATIO),
      height: diameter,
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    const { cx, cy, radius } = SequentialStorageShape.circle(bounds);

    return [
      { side: Side.Top, position: { x: cx, y: cy - radius } },
      { side: Side.Right, position: { x: cx + radius, y: cy } },
      { side: Side.Bottom, position: { x: cx, y: cy + radius } },
      { side: Side.Left, position: { x: cx - radius, y: cy } },
    ];
  }

  public override labelCenter(bounds: Rect): Point {
    const { cx, cy } = SequentialStorageShape.circle(bounds);

    return { x: cx, y: cy };
  }

  public override draw(bounds: Rect): SvgNode {
    const { cx, cy, radius } = SequentialStorageShape.circle(bounds);

    return svgNode("g", {}, [
      svgNode("circle", {
        cx: roundTo(cx),
        cy: roundTo(cy),
        r: roundTo(radius),
      }),
      line(cx, cy + radius, bounds.x + bounds.width, cy + radius),
    ]);
  }

  /** The circle fills the height; the tail takes what is left of the width. */
  private static circle(bounds: Rect): {
    readonly cx: number;
    readonly cy: number;
    readonly radius: number;
  } {
    const diameter = bounds.height;

    return {
      cx: bounds.x + diameter / 2,
      cy: bounds.y + bounds.height / 2,
      radius: diameter / 2,
    };
  }
}
