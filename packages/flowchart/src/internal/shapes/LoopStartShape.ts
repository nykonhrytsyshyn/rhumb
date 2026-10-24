import {
  type Port,
  type Rect,
  Shape,
  type Size,
  type SvgNode,
} from "@rhumb/kernel";

import { bottom, polygon, right } from "./geometry";

/** Rectangle with the top corners cut: where a loop begins. */
export class LoopStartShape extends Shape {
  private static readonly CUT_RATIO = 0.25;

  public override measure(text: Size): Size {
    return {
      width: text.width + text.height * LoopStartShape.CUT_RATIO * 2,
      height: text.height,
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    return Shape.sideMiddles(bounds);
  }

  public override draw(bounds: Rect): SvgNode {
    const cut = bounds.height * LoopStartShape.CUT_RATIO;

    return polygon([
      [bounds.x + cut, bounds.y],
      [right(bounds) - cut, bounds.y],
      [right(bounds), bounds.y + cut],
      [right(bounds), bottom(bounds)],
      [bounds.x, bottom(bounds)],
      [bounds.x, bounds.y + cut],
    ]);
  }
}
