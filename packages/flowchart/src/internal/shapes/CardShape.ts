import {
  type Port,
  type Rect,
  Shape,
  type Size,
  type SvgNode,
} from "@rhumb/kernel";

import { bottom, polygon, right } from "./geometry";

/** Rectangle with a cut corner: data on a punched or magnetic card. */
export class CardShape extends Shape {
  private static readonly CUT_RATIO = 0.25;

  public override measure(text: Size): Size {
    return {
      width: text.width + text.height * CardShape.CUT_RATIO,
      height: text.height,
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    return Shape.sideMiddles(bounds);
  }

  public override draw(bounds: Rect): SvgNode {
    const cut = bounds.height * CardShape.CUT_RATIO;

    return polygon([
      [bounds.x + cut, bounds.y],
      [right(bounds), bounds.y],
      [right(bounds), bottom(bounds)],
      [bounds.x, bottom(bounds)],
      [bounds.x, bounds.y + cut],
    ]);
  }
}
