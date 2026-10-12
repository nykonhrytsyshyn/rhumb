import {
  type Port,
  type Rect,
  Shape,
  type Size,
  type SvgNode,
  roundTo,
  svgNode,
} from "@rhumb/kernel";

/** Stadium: a rectangle whose short sides are fully rounded. */
export class TerminatorShape extends Shape {
  public override measure(text: Size): Size {
    return { width: text.width + text.height, height: text.height };
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
      rx: roundTo(bounds.height / 2),
      ry: roundTo(bounds.height / 2),
    });
  }
}
