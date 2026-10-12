import {
  type Port,
  type Rect,
  Shape,
  type Size,
  type SvgNode,
  roundTo,
  svgNode,
} from "@rhumb/kernel";

/** Small circle used to join parts of a diagram. */
export class ConnectorShape extends Shape {
  public override measure(text: Size): Size {
    const diameter = Math.max(text.width, text.height);

    return { width: diameter, height: diameter };
  }

  public override ports(bounds: Rect): readonly Port[] {
    return Shape.sideMiddles(bounds);
  }

  public override draw(bounds: Rect): SvgNode {
    return svgNode("circle", {
      cx: roundTo(bounds.x + bounds.width / 2),
      cy: roundTo(bounds.y + bounds.height / 2),
      r: roundTo(Math.min(bounds.width, bounds.height) / 2),
    });
  }
}
