import {
  type Port,
  type Rect,
  Shape,
  type Size,
  type SvgNode,
  roundTo,
  svgNode,
} from "@rhumb/kernel";

export class ProcessShape extends Shape {
  public override measure(text: Size): Size {
    return text;
  }

  public override ports(bounds: Rect): readonly Port[] {
    return Shape.sideMiddles(bounds);
  }

  public override draw(bounds: Rect): SvgNode {
    return svgNode("rect", {
      x: roundTo(bounds.x),
      y: roundTo(bounds.y),
      width: roundTo(bounds.width),
      height: roundTo(bounds.height),
    });
  }
}
