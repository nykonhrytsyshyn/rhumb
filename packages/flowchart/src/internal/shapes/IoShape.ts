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

/** Parallelogram used for data input and output. */
export class IoShape extends Shape {
  private static readonly SKEW_RATIO = 0.3;

  public override measure(text: Size): Size {
    return {
      width: text.width + text.height * IoShape.SKEW_RATIO * 2,
      height: text.height,
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    const skew = IoShape.skew(bounds);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;

    return [
      { side: Side.Top, position: { x: cx, y: bounds.y } },
      {
        side: Side.Right,
        position: { x: bounds.x + bounds.width - skew / 2, y: cy },
      },
      { side: Side.Bottom, position: { x: cx, y: bounds.y + bounds.height } },
      { side: Side.Left, position: { x: bounds.x + skew / 2, y: cy } },
    ];
  }

  public override draw(bounds: Rect): SvgNode {
    const skew = IoShape.skew(bounds);
    const right = bounds.x + bounds.width;
    const bottom = bounds.y + bounds.height;
    const points = [
      [bounds.x + skew, bounds.y],
      [right, bounds.y],
      [right - skew, bottom],
      [bounds.x, bottom],
    ]
      .map(([x, y]) => `${String(roundTo(x ?? 0))},${String(roundTo(y ?? 0))}`)
      .join(" ");

    return svgNode("polygon", { points });
  }

  private static skew(bounds: Rect): number {
    return bounds.height * IoShape.SKEW_RATIO;
  }
}
