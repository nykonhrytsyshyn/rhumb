import {
  type Point,
  type Port,
  type Rect,
  Shape,
  Side,
  type Size,
  type SvgNode,
} from "@rhumb/kernel";

import { bottom, path, right } from "./geometry";

/** Rectangle with a wavy bottom edge: data on a human-readable medium. */
export class DocumentShape extends Shape {
  /** Height of the wave, as a share of the block's height. */
  private static readonly WAVE_RATIO = 0.1;

  public override measure(text: Size): Size {
    return {
      width: text.width,
      height: text.height / (1 - DocumentShape.WAVE_RATIO * 2),
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    const wave = DocumentShape.wave(bounds);
    const cx = bounds.x + bounds.width / 2;
    const middle = bounds.y + (bounds.height - wave) / 2;

    return [
      { side: Side.Top, position: { x: cx, y: bounds.y } },
      { side: Side.Right, position: { x: right(bounds), y: middle } },
      { side: Side.Bottom, position: { x: cx, y: bottom(bounds) - wave } },
      { side: Side.Left, position: { x: bounds.x, y: middle } },
    ];
  }

  public override labelCenter(bounds: Rect): Point {
    const wave = DocumentShape.wave(bounds);

    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + (bounds.height - wave * 2) / 2,
    };
  }

  public override draw(bounds: Rect): SvgNode {
    const wave = DocumentShape.wave(bounds);
    const base = bottom(bounds) - wave;
    const cx = bounds.x + bounds.width / 2;

    return path(
      "M",
      bounds.x,
      bounds.y,
      "L",
      right(bounds),
      bounds.y,
      "L",
      right(bounds),
      base,
      "Q",
      bounds.x + (bounds.width * 3) / 4,
      base + wave * 2,
      cx,
      base,
      "T",
      bounds.x,
      base,
      "Z",
    );
  }

  private static wave(bounds: Rect): number {
    return bounds.height * DocumentShape.WAVE_RATIO;
  }
}
