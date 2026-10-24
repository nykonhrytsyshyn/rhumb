import {
  type Port,
  type Rect,
  Shape,
  Side,
  type Size,
  type SvgNode,
} from "@rhumb/kernel";

import { bottom, openPath, right } from "./geometry";

/**
 * A bracket with the note beside it. The bracket stands on the side that
 * faces the block the note belongs to; the dashed line ends there.
 */
export class CommentShape extends Shape {
  private static readonly TICK_RATIO = 0.3;

  private towards: Side = Side.Left;

  /** Chooses the side of the note that faces the block it explains. */
  public face(side: Side): void {
    this.towards = side;
  }

  public get facing(): Side {
    return this.towards;
  }

  protected override alignment(): "start" | "middle" | "end" {
    return this.towards === Side.Right ? "end" : "start";
  }

  public override readonly compact = true;

  /** The note is the text with an equal margin on every side. */
  public override measure(text: Size): Size {
    return text;
  }

  public override ports(bounds: Rect): readonly Port[] {
    return Shape.sideMiddles(bounds);
  }

  public override draw(bounds: Rect): SvgNode {
    const tick = CommentShape.tick(bounds);

    switch (this.towards) {
      case Side.Left:
        return openPath(
          "M",
          bounds.x + tick,
          bounds.y,
          "L",
          bounds.x,
          bounds.y,
          "L",
          bounds.x,
          bottom(bounds),
          "L",
          bounds.x + tick,
          bottom(bounds),
        );
      case Side.Right:
        return openPath(
          "M",
          right(bounds) - tick,
          bounds.y,
          "L",
          right(bounds),
          bounds.y,
          "L",
          right(bounds),
          bottom(bounds),
          "L",
          right(bounds) - tick,
          bottom(bounds),
        );
      case Side.Top:
        return openPath(
          "M",
          bounds.x,
          bounds.y + tick,
          "L",
          bounds.x,
          bounds.y,
          "L",
          right(bounds),
          bounds.y,
          "L",
          right(bounds),
          bounds.y + tick,
        );
      case Side.Bottom:
        return openPath(
          "M",
          bounds.x,
          bottom(bounds) - tick,
          "L",
          bounds.x,
          bottom(bounds),
          "L",
          right(bounds),
          bottom(bounds),
          "L",
          right(bounds),
          bottom(bounds) - tick,
        );
    }
  }

  /** Length of the short strokes of the bracket. */
  private static tick(bounds: Rect): number {
    return Math.min(bounds.width, bounds.height) * CommentShape.TICK_RATIO;
  }
}
