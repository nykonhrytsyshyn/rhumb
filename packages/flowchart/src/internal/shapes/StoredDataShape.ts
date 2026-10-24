import {
  type Port,
  type Rect,
  Shape,
  Side,
  type Size,
  type SvgNode,
} from "@rhumb/kernel";

import { bottom, path, right } from "./geometry";

/**
 * Straight top and bottom, and two sides that bend the same way, both
 * bulging to the left: data kept in a form fit for processing.
 */
export class StoredDataShape extends Shape {
  private static readonly BEND_RATIO = 0.25;

  public override measure(text: Size): Size {
    return {
      width: text.width + text.height * StoredDataShape.BEND_RATIO * 2,
      height: text.height,
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    const bend = StoredDataShape.bend(bounds);
    const cy = bounds.y + bounds.height / 2;

    return [
      {
        side: Side.Top,
        position: { x: (bounds.x + bend + right(bounds)) / 2, y: bounds.y },
      },
      { side: Side.Right, position: { x: right(bounds) - bend, y: cy } },
      {
        side: Side.Bottom,
        position: {
          x: (bounds.x + bend + right(bounds)) / 2,
          y: bottom(bounds),
        },
      },
      { side: Side.Left, position: { x: bounds.x, y: cy } },
    ];
  }

  public override labelCenter(bounds: Rect): { x: number; y: number } {
    const bend = StoredDataShape.bend(bounds);

    return {
      x: bounds.x + (bounds.width - bend) / 2,
      y: bounds.y + bounds.height / 2,
    };
  }

  // prettier-ignore
  public override draw(bounds: Rect): SvgNode {
    const bend = StoredDataShape.bend(bounds);
    const cy = bounds.y + bounds.height / 2;
    const left = bounds.x + bend;

    return path(
      "M", left, bounds.y,
      "L", right(bounds), bounds.y,
      "Q", right(bounds) - bend * 2, cy, right(bounds), bottom(bounds),
      "L", left, bottom(bounds),
      "Q", bounds.x - bend, cy, left, bounds.y,
      "Z",
    );
  }

  /** How far the middle of a side lies from its ends. */
  private static bend(bounds: Rect): number {
    return bounds.height * StoredDataShape.BEND_RATIO;
  }
}
