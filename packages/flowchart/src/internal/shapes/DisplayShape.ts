import {
  type Point,
  type Port,
  type Rect,
  Shape,
  type Size,
  type SvgNode,
} from "@rhumb/kernel";

import { bottom, path, right } from "./geometry";

/** Pointed on the left, rounded on the right: data shown on a screen. */
export class DisplayShape extends Shape {
  private static readonly POINT_RATIO = 0.35;
  private static readonly ROUND_RATIO = 0.25;

  public override measure(text: Size): Size {
    return {
      width:
        text.width +
        text.height * (DisplayShape.POINT_RATIO + DisplayShape.ROUND_RATIO),
      height: text.height,
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    return Shape.sideMiddles(bounds);
  }

  public override labelCenter(bounds: Rect): Point {
    const point = bounds.height * DisplayShape.POINT_RATIO;
    const round = bounds.height * DisplayShape.ROUND_RATIO;

    return {
      x: bounds.x + (point + bounds.width - round) / 2,
      y: bounds.y + bounds.height / 2,
    };
  }

  public override draw(bounds: Rect): SvgNode {
    const point = bounds.height * DisplayShape.POINT_RATIO;
    const round = bounds.height * DisplayShape.ROUND_RATIO;
    const cy = bounds.y + bounds.height / 2;

    return path(
      "M",
      bounds.x + point,
      bounds.y,
      "L",
      right(bounds) - round,
      bounds.y,
      "A",
      round,
      bounds.height / 2,
      0,
      0,
      1,
      right(bounds) - round,
      bottom(bounds),
      "L",
      bounds.x + point,
      bottom(bounds),
      "L",
      bounds.x,
      cy,
      "Z",
    );
  }
}
