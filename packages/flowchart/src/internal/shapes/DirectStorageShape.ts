import {
  type Point,
  type Port,
  type Rect,
  Shape,
  type Size,
  type SvgNode,
  svgNode,
} from "@rhumb/kernel";

import { bottom, path, right } from "./geometry";

/** Cylinder lying on its side: a magnetic disk or drum. */
export class DirectStorageShape extends Shape {
  private static readonly CAP_RATIO = 0.25;

  public override measure(text: Size): Size {
    return {
      width: text.width + text.height * DirectStorageShape.CAP_RATIO * 3,
      height: text.height,
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    return Shape.sideMiddles(bounds);
  }

  /** The text keeps clear of the inner arc at the right end. */
  public override labelCenter(bounds: Rect): Point {
    const cap = bounds.height * DirectStorageShape.CAP_RATIO;

    return {
      x: bounds.x + (bounds.width - cap * 2) / 2,
      y: bounds.y + bounds.height / 2,
    };
  }

  public override draw(bounds: Rect): SvgNode {
    const cap = bounds.height * DirectStorageShape.CAP_RATIO;
    const radiusY = bounds.height / 2;
    const rightEdge = right(bounds) - cap;
    const arc = (sweep: 0 | 1, toY: number): (string | number)[] => [
      "A",
      cap,
      radiusY,
      0,
      0,
      sweep,
      rightEdge,
      toY,
    ];

    return svgNode("g", {}, [
      path(
        "M",
        bounds.x + cap,
        bounds.y,
        "L",
        rightEdge,
        bounds.y,
        ...arc(1, bottom(bounds)),
        "L",
        bounds.x + cap,
        bottom(bounds),
        "A",
        cap,
        radiusY,
        0,
        0,
        1,
        bounds.x + cap,
        bounds.y,
        "Z",
      ),
      path("M", rightEdge, bounds.y, ...arc(0, bottom(bounds))),
    ]);
  }
}
