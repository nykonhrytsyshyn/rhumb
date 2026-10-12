import {
  type Port,
  type Rect,
  Shape,
  type Size,
  type SvgNode,
  roundTo,
  svgNode,
} from "@rhumb/kernel";

/** Rectangle with a second vertical line near each side. */
export class PredefinedProcessShape extends Shape {
  private static readonly INSET_RATIO = 0.2;

  public override measure(text: Size): Size {
    return {
      width: text.width + text.height * PredefinedProcessShape.INSET_RATIO * 2,
      height: text.height,
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    return Shape.sideMiddles(bounds);
  }

  public override draw(bounds: Rect): SvgNode {
    const inset = bounds.height * PredefinedProcessShape.INSET_RATIO;
    const top = roundTo(bounds.y);
    const bottom = roundTo(bounds.y + bounds.height);
    const leftLine = roundTo(bounds.x + inset);
    const rightLine = roundTo(bounds.x + bounds.width - inset);

    return svgNode("g", {}, [
      svgNode("rect", {
        x: roundTo(bounds.x),
        y: top,
        width: roundTo(bounds.width),
        height: roundTo(bounds.height),
      }),
      svgNode("line", { x1: leftLine, y1: top, x2: leftLine, y2: bottom }),
      svgNode("line", { x1: rightLine, y1: top, x2: rightLine, y2: bottom }),
    ]);
  }
}
