import {
  type Port,
  type Rect,
  Shape,
  Side,
  type Size,
  type SvgNode,
  roundTo,
  svgNode,
} from "@rhumb/kernel";

/** Rhombus whose lines attach to its four vertices. */
export class DecisionShape extends Shape {
  public override measure(text: Size): Size {
    return { width: text.width * 2, height: text.height * 2 };
  }

  public override ports(bounds: Rect): readonly Port[] {
    return Shape.sideMiddles(bounds);
  }

  public override draw(bounds: Rect): SvgNode {
    const vertices = [Side.Top, Side.Right, Side.Bottom, Side.Left].map(
      (side) => this.port(bounds, side).position,
    );
    const points = vertices
      .map((point) => `${String(roundTo(point.x))},${String(roundTo(point.y))}`)
      .join(" ");

    return svgNode("polygon", { points });
  }
}
