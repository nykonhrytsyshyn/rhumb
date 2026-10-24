import {
  type Direction,
  type Port,
  type Rect,
  Shape,
  Side,
  type Size,
  type SvgNode,
  svgNode,
} from "@rhumb/kernel";

import { line } from "./geometry";

/**
 * Two parallel lines: the start or the end of operations that run side by
 * side. It is drawn across the flow and stretched by the renderer to reach
 * every line that meets it.
 */
export class ParallelShape extends Shape {
  private gap = 0;
  private margin = 0;

  public override readonly showsText = false;

  private upright = false;

  /** Sets the distance between the two lines and the free space around them. */
  public gauge(gap: number, margin: number): void {
    this.gap = gap;
    this.margin = margin;
  }

  /** Thickness of the bar with the space kept around it. */
  public get thickness(): number {
    return this.gap + this.margin * 2;
  }

  public override readonly ownThickness = true;

  public override alongFlow(direction: Direction): void {
    this.upright = direction === "LR" || direction === "RL";
  }

  protected override isTurned(): boolean {
    return this.upright;
  }

  public override measure(): Size {
    return { width: 0, height: 0 };
  }

  public override ports(bounds: Rect): readonly Port[] {
    const [first, second] = this.pair(bounds);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;

    return this.upright
      ? [
          { side: Side.Top, position: { x: cx, y: bounds.y } },
          { side: Side.Right, position: { x: second, y: cy } },
          {
            side: Side.Bottom,
            position: { x: cx, y: bounds.y + bounds.height },
          },
          { side: Side.Left, position: { x: first, y: cy } },
        ]
      : [
          { side: Side.Top, position: { x: cx, y: first } },
          { side: Side.Right, position: { x: bounds.x + bounds.width, y: cy } },
          { side: Side.Bottom, position: { x: cx, y: second } },
          { side: Side.Left, position: { x: bounds.x, y: cy } },
        ];
  }

  public override draw(bounds: Rect): SvgNode {
    const [first, second] = this.pair(bounds);
    const r = bounds.x + bounds.width;
    const b = bounds.y + bounds.height;

    return svgNode(
      "g",
      {},
      this.upright
        ? [line(first, bounds.y, first, b), line(second, bounds.y, second, b)]
        : [line(bounds.x, first, r, first), line(bounds.x, second, r, second)],
    );
  }

  /** Where the two lines lie across the thin side of the bar. */
  public pair(bounds: Rect): readonly [number, number] {
    const centre = this.upright
      ? bounds.x + bounds.width / 2
      : bounds.y + bounds.height / 2;

    return [centre - this.gap / 2, centre + this.gap / 2];
  }

  public get isUpright(): boolean {
    return this.upright;
  }
}
