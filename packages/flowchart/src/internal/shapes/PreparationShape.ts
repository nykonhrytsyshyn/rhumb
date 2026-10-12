import {
  type Port,
  type Rect,
  Shape,
  type Size,
  type SvgNode,
  roundTo,
  svgNode,
} from "@rhumb/kernel";

/** Elongated hexagon for loop headers and initialization. */
export class PreparationShape extends Shape {
  private static readonly CORNER_RATIO = 0.25;

  public override measure(text: Size): Size {
    return {
      width: text.width + text.height * PreparationShape.CORNER_RATIO * 2,
      height: text.height,
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    return Shape.sideMiddles(bounds);
  }

  public override draw(bounds: Rect): SvgNode {
    const corner = bounds.height * PreparationShape.CORNER_RATIO;
    const right = bounds.x + bounds.width;
    const bottom = bounds.y + bounds.height;
    const middle = bounds.y + bounds.height / 2;
    const points = [
      [bounds.x + corner, bounds.y],
      [right - corner, bounds.y],
      [right, middle],
      [right - corner, bottom],
      [bounds.x + corner, bottom],
      [bounds.x, middle],
    ]
      .map(([x, y]) => `${String(roundTo(x ?? 0))},${String(roundTo(y ?? 0))}`)
      .join(" ");

    return svgNode("polygon", { points });
  }
}
