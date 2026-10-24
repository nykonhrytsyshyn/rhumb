import {
  type Port,
  type Rect,
  Shape,
  type Size,
  type SvgNode,
} from "@rhumb/kernel";

import { bottom, polygon, right } from "./geometry";

/** Rectangle with the bottom corners cut: where a loop ends. */
export class LoopEndShape extends Shape {
  private static readonly CUT_RATIO = 0.25;

  public override measure(text: Size): Size {
    return {
      width: text.width + text.height * LoopEndShape.CUT_RATIO * 2,
      height: text.height,
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    return Shape.sideMiddles(bounds);
  }

  public override draw(bounds: Rect): SvgNode {
    const cut = bounds.height * LoopEndShape.CUT_RATIO;

    return polygon([
      [bounds.x, bounds.y],
      [right(bounds), bounds.y],
      [right(bounds), bottom(bounds) - cut],
      [right(bounds) - cut, bottom(bounds)],
      [bounds.x + cut, bottom(bounds)],
      [bounds.x, bottom(bounds) - cut],
    ]);
  }
}
