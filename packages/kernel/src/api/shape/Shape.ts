import type { DiagramNode, Direction, Point, Rect, Size } from "../model";
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

  /**
   * Where the text of the block is centred. Most blocks centre it; a few,
   * such as the triangle, hold it off to one side.
   */
  public labelCenter(bounds: Rect): Point {
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
  }

  /**
   * Places on the outline of one side where a note may be tied, best first:
   * the port, then points a quarter of the way along the side from either
   * end, for when a line already leaves by the port. Blocks drawn as a
   * polygon or a rectangle offer them; the others only offer the port.
   */
  public notePoints(bounds: Rect, side: Side): readonly Point[] {
    const port = this.port(bounds, side).position;
    const outline = Shape.cornersOf(this.draw(bounds));

    if (outline === undefined) {
      return [port];
    }

    const horizontal = side === Side.Left || side === Side.Right;
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const reach = (horizontal ? bounds.height : bounds.width) / 4;
    const found = [-reach, reach].flatMap((offset) => {
      const hit = Shape.outlineHit(
        outline,
        side,
        horizontal ? cy + offset : cx + offset,
      );

      return hit === undefined ? [] : [hit];
    });

    return [port, ...found];
  }

  /** The corners of a drawn polygon or rectangle, if it is one. */
  private static cornersOf(node: SvgNode): readonly Point[] | undefined {
    if (node.tag === "polygon" && typeof node.attrs.points === "string") {
      return node.attrs.points.split(" ").map((pair) => {
        const [x, y] = pair.split(",").map(Number);

        return { x: x ?? 0, y: y ?? 0 };
      });
    }

    if (node.tag === "rect") {
      const x = Number(node.attrs.x);
      const y = Number(node.attrs.y);
      const width = Number(node.attrs.width);
      const height = Number(node.attrs.height);

      return [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height },
      ];
    }

    const first = node.children.find(
      (child): child is SvgNode => typeof child !== "string",
    );

    return node.tag === "g" && first !== undefined
      ? Shape.cornersOf(first)
      : undefined;
  }

  /**
   * Where a line across the outline, at `at` (a height for the left and right
   * sides, an offset for the top and bottom), leaves it on the given side.
   */
  private static outlineHit(
    corners: readonly Point[],
    side: Side,
    at: number,
  ): Point | undefined {
    const horizontal = side === Side.Left || side === Side.Right;
    const hits: Point[] = [];

    corners.forEach((from, index) => {
      const to = corners[(index + 1) % corners.length] ?? from;
      const [a, b] = horizontal ? [from.y, to.y] : [from.x, to.x];

      if ((a - at) * (b - at) > 0 || a === b) {
        return;
      }

      const t = (at - a) / (b - a);

      hits.push(
        horizontal
          ? { x: from.x + (to.x - from.x) * t, y: at }
          : { x: at, y: from.y + (to.y - from.y) * t },
      );
    });

    const pick = (axis: "x" | "y", smallest: boolean): Point | undefined =>
      hits.reduce<Point | undefined>(
        (best, hit) =>
          best === undefined ||
          (smallest ? hit[axis] < best[axis] : hit[axis] > best[axis])
            ? hit
            : best,
        undefined,
      );

    switch (side) {
      case Side.Left:
        return pick("x", true);
      case Side.Right:
        return pick("x", false);
      case Side.Top:
        return pick("y", true);
      case Side.Bottom:
        return pick("y", false);
    }
  }

  /**
   * Tells the block which way the diagram flows, for blocks drawn along the
   * flow (the triangle, the parallel bar). Called before the block is sized.
   */
  public alongFlow(direction: Direction): void {
    this.flowing = direction;
  }

  /** The way the diagram flows, once the renderer has said so. */
  protected flowing: Direction = "TB";

  /** Whether the block is drawn on its side, so that its minimum size is too. */
  public get turned(): boolean {
    return this.isTurned();
  }

  protected isTurned(): boolean {
    return false;
  }

  /** How the text is set against its centre: from its left edge, centred or from its right edge. */
  public get textAlign(): "start" | "middle" | "end" {
    return this.alignment();
  }

  protected alignment(): "start" | "middle" | "end" {
    return "middle";
  }

  /** Whether the block keeps its proportions: it is scaled, never stretched, to a size. */
  public get proportional(): boolean {
    return this.keepsProportions();
  }

  protected keepsProportions(): boolean {
    return false;
  }

  /** Whether the block sets its own thickness, which is not rounded to the grid. */
  public readonly ownThickness: boolean = false;

  /** Whether the text sits closer to the outline than in other blocks. */
  public readonly compact: boolean = false;

  /** Whether the block shows its text at all. */
  public readonly showsText: boolean = true;

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
