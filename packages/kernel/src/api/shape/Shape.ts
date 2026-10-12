import type { DiagramNode, Point, Rect, Size } from "../model";
import { Side } from "../model";
import type { SvgNode } from "../svg";

export interface Port {
  readonly side: Side;
  readonly position: Point;
}

/**
 * Base class for every block a diagram can contain.
 * Shapes only know their geometry; styling is applied by the renderer.
 */
export abstract class Shape {
  public constructor(protected readonly node: DiagramNode) {}

  /** Preferred size that fits a text block of the given size. */
  public abstract measure(text: Size): Size;

  /** Line attachment points for the given bounds. */
  public abstract ports(bounds: Rect): readonly Port[];

  public abstract draw(bounds: Rect): SvgNode;

  public port(bounds: Rect, side: Side): Port {
    const found = this.ports(bounds).find((port) => port.side === side);
    if (found === undefined) {
      throw new Error(`Shape "${this.node.id}" has no ${side} port`);
    }
    return found;
  }

  /** Ports located at the middle of each side of the bounds. */
  protected static sideMiddles(bounds: Rect): readonly Port[] {
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;

    return [
      { side: Side.Top, position: { x: cx, y: bounds.y } },
      { side: Side.Right, position: { x: bounds.x + bounds.width, y: cy } },
      { side: Side.Bottom, position: { x: cx, y: bounds.y + bounds.height } },
      { side: Side.Left, position: { x: bounds.x, y: cy } },
    ];
  }
}
