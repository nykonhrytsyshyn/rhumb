import {
  type Point,
  type Port,
  type Rect,
  Shape,
  Side,
  type Size,
  type SvgNode,
} from "@rhumb/kernel";

import { bottom, polygon, right } from "./geometry";

/** Rectangle with a sloping top edge: data keyed in by hand. */
export class ManualInputShape extends Shape {
  private static readonly SLOPE_RATIO = 0.2;

  public override measure(text: Size): Size {
    return {
      width: text.width,
      height: text.height / (1 - ManualInputShape.SLOPE_RATIO),
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    const slope = ManualInputShape.slope(bounds);
    const cx = bounds.x + bounds.width / 2;

    return [
      { side: Side.Top, position: { x: cx, y: bounds.y + slope / 2 } },
      {
        side: Side.Right,
        position: { x: right(bounds), y: bounds.y + bounds.height / 2 },
      },
      { side: Side.Bottom, position: { x: cx, y: bottom(bounds) } },
      {
        side: Side.Left,
        position: { x: bounds.x, y: bounds.y + (bounds.height + slope) / 2 },
      },
    ];
  }

  public override labelCenter(bounds: Rect): Point {
    const slope = ManualInputShape.slope(bounds);

    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + slope + (bounds.height - slope) / 2,
    };
  }

  public override draw(bounds: Rect): SvgNode {
    const slope = ManualInputShape.slope(bounds);

    return polygon([
      [bounds.x, bounds.y + slope],
      [right(bounds), bounds.y],
      [right(bounds), bottom(bounds)],
      [bounds.x, bottom(bounds)],
    ]);
  }

  private static slope(bounds: Rect): number {
    return bounds.height * ManualInputShape.SLOPE_RATIO;
  }
}
