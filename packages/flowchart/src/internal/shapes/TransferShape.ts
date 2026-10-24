import {
  type Direction,
  type Point,
  type Port,
  type Rect,
  Shape,
  Side,
  type Size,
  type SvgNode,
} from "@rhumb/kernel";

import { type Pair, polygon } from "./geometry";

const POINTING: Readonly<Record<Direction, Side>> = {
  TB: Side.Bottom,
  BT: Side.Top,
  LR: Side.Right,
  RL: Side.Left,
};

/**
 * Corners of the triangle for a given bounding box, its tip towards `tip`.
 */
export function triangleCorners(bounds: Rect, tip: Side): readonly Pair[] {
  const { x, y, width, height } = bounds;
  const r = x + width;
  const b = y + height;

  switch (tip) {
    case Side.Right:
      return [
        [x, y],
        [r, y + height / 2],
        [x, b],
      ];
    case Side.Left:
      return [
        [r, y],
        [x, y + height / 2],
        [r, b],
      ];
    case Side.Bottom:
      return [
        [x, y],
        [r, y],
        [x + width / 2, b],
      ];
    case Side.Top:
      return [
        [x, b],
        [r, b],
        [x + width / 2, y],
      ];
  }
}

/**
 * Triangle set on a line: the line comes in at the middle of the flat side
 * and goes out at the tip, which points the way the diagram flows. It holds
 * a short mark (a letter) that the legend under the diagram explains.
 */
export class TransferShape extends Shape {
  /** Height of an equilateral triangle, as a share of its side. */
  private static readonly HEIGHT = Math.sqrt(3) / 2;

  private tip: Side = Side.Bottom;

  public override alongFlow(direction: Direction): void {
    this.tip = POINTING[direction];
  }

  public get pointing(): Side {
    return this.tip;
  }

  protected override keepsProportions(): boolean {
    return true;
  }

  /** An equilateral triangle, sized to hold the mark with room around it. */
  public override measure(text: Size): Size {
    const side = Math.max(text.width, text.height) * 2.2;
    const height = side * TransferShape.HEIGHT;

    return this.vertical()
      ? { width: side, height }
      : { width: height, height: side };
  }

  public override ports(bounds: Rect): readonly Port[] {
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const r = bounds.x + bounds.width;
    const b = bounds.y + bounds.height;
    const flat = (side: Side): Point => {
      switch (side) {
        case Side.Top:
          return { x: cx, y: bounds.y };
        case Side.Bottom:
          return { x: cx, y: b };
        case Side.Left:
          return { x: bounds.x, y: cy };
        case Side.Right:
          return { x: r, y: cy };
      }
    };
    const sides = [Side.Top, Side.Right, Side.Bottom, Side.Left] as const;

    return sides.map((side) => ({ side, position: flat(side) }));
  }

  public override labelCenter(bounds: Rect): Point {
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;
    const along = this.vertical() ? bounds.height : bounds.width;
    const shift = along / 6;

    switch (this.tip) {
      case Side.Bottom:
        return { x: cx, y: cy - shift };
      case Side.Top:
        return { x: cx, y: cy + shift };
      case Side.Right:
        return { x: cx - shift, y: cy };
      case Side.Left:
        return { x: cx + shift, y: cy };
    }
  }

  public override draw(bounds: Rect): SvgNode {
    return polygon(triangleCorners(bounds, this.tip));
  }

  private vertical(): boolean {
    return this.tip === Side.Top || this.tip === Side.Bottom;
  }
}
