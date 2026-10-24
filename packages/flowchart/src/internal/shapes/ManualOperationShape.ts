import {
  type Port,
  type Rect,
  Shape,
  Side,
  type Size,
  type SvgNode,
} from "@rhumb/kernel";

import { bottom, polygon, right } from "./geometry";

/** Trapezoid that is wider at the top: any operation done by a person. */
export class ManualOperationShape extends Shape {
  private static readonly SLOPE_RATIO = 0.25;

  public override measure(text: Size): Size {
    return {
      width: text.width + text.height * ManualOperationShape.SLOPE_RATIO * 2,
      height: text.height,
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    const slope = ManualOperationShape.slope(bounds);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;

    return [
      { side: Side.Top, position: { x: cx, y: bounds.y } },
      { side: Side.Right, position: { x: right(bounds) - slope / 2, y: cy } },
      { side: Side.Bottom, position: { x: cx, y: bottom(bounds) } },
      { side: Side.Left, position: { x: bounds.x + slope / 2, y: cy } },
    ];
  }

  public override draw(bounds: Rect): SvgNode {
    const slope = ManualOperationShape.slope(bounds);

    return polygon([
      [bounds.x, bounds.y],
      [right(bounds), bounds.y],
      [right(bounds) - slope, bottom(bounds)],
      [bounds.x + slope, bottom(bounds)],
    ]);
  }

  private static slope(bounds: Rect): number {
    return bounds.height * ManualOperationShape.SLOPE_RATIO;
  }
}
