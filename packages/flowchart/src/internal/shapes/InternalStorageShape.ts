import {
  type Point,
  type Port,
  type Rect,
  Shape,
  Side,
  type Size,
  type SvgNode,
  roundTo,
  svgNode,
} from "@rhumb/kernel";

import { bottom, line, right } from "./geometry";

/** Rectangle with a line along the top and the left: data in main memory. */
export class InternalStorageShape extends Shape {
  private static readonly BAND_RATIO = 0.2;

  public override measure(text: Size): Size {
    const height = text.height / (1 - InternalStorageShape.BAND_RATIO);

    return {
      width: text.width + height * InternalStorageShape.BAND_RATIO,
      height,
    };
  }

  public override ports(bounds: Rect): readonly Port[] {
    const band = InternalStorageShape.band(bounds);
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;

    return [
      { side: Side.Top, position: { x: cx, y: bounds.y } },
      { side: Side.Right, position: { x: right(bounds), y: cy } },
      { side: Side.Bottom, position: { x: cx, y: bottom(bounds) } },
      { side: Side.Left, position: { x: bounds.x, y: cy + band / 2 } },
    ];
  }

  public override labelCenter(bounds: Rect): Point {
    const band = InternalStorageShape.band(bounds);

    return {
      x: bounds.x + band + (bounds.width - band) / 2,
      y: bounds.y + band + (bounds.height - band) / 2,
    };
  }

  public override draw(bounds: Rect): SvgNode {
    const band = InternalStorageShape.band(bounds);

    return svgNode("g", {}, [
      svgNode("rect", {
        x: roundTo(bounds.x),
        y: roundTo(bounds.y),
        width: roundTo(bounds.width),
        height: roundTo(bounds.height),
      }),
      line(bounds.x, bounds.y + band, right(bounds), bounds.y + band),
      line(bounds.x + band, bounds.y, bounds.x + band, bottom(bounds)),
    ]);
  }

  private static band(bounds: Rect): number {
    return bounds.height * InternalStorageShape.BAND_RATIO;
  }
}
