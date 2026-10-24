import {
  type Port,
  type Rect,
  Shape,
  Side,
  type Size,
  type SvgNode,
} from "@rhumb/kernel";

import { bottom, path, right } from "./geometry";

/** Strip with wavy top and bottom edges: data on a paper tape. */
export class PaperTapeShape extends Shape {
  private static readonly WAVE_RATIO = 0.08;

  public override measure(text: Size): Size {
    return {
      width: text.width,
      height: text.height / (1 - PaperTapeShape.WAVE_RATIO * 4),
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    const wave = PaperTapeShape.wave(bounds);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;

    return [
      { side: Side.Top, position: { x: cx, y: bounds.y + wave } },
      { side: Side.Right, position: { x: right(bounds), y: cy } },
      { side: Side.Bottom, position: { x: cx, y: bottom(bounds) - wave } },
      { side: Side.Left, position: { x: bounds.x, y: cy } },
    ];
  }

  public override draw(bounds: Rect): SvgNode {
    const wave = PaperTapeShape.wave(bounds);
    const cx = bounds.x + bounds.width / 2;
    const quarter = bounds.width / 4;
    const top = bounds.y + wave;
    const base = bottom(bounds) - wave;

    return path(
      "M",
      bounds.x,
      top,
      "Q",
      bounds.x + quarter,
      top - wave * 2,
      cx,
      top,
      "T",
      right(bounds),
      top,
      "L",
      right(bounds),
      base,
      "Q",
      bounds.x + quarter * 3,
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
    return bounds.height * PaperTapeShape.WAVE_RATIO;
  }
}
