import type { DiagramNode, Rect, Size } from "@rhumb/kernel";

import type { Metrics } from "./Metrics";

/**
 * What a block carries around its shape: the stripe that points to a
 * detailed representation, and the copies that overlap it behind.
 */
export class NodeFrame {
  public constructor(private readonly metrics: Metrics) {}

  /** How many overlapping copies are drawn, the front one included. */
  public copies(node: DiagramNode): number {
    return Math.max(1, node.stack ?? 1);
  }

  /** Height of the stripe at the top of the shape; none without a reference. */
  public band(node: DiagramNode): number {
    const { textStyle, padding } = this.metrics;

    return node.ref === undefined
      ? 0
      : textStyle.size * textStyle.lineHeight + padding;
  }

  /** How far each copy sits from the one in front of it. */
  public shift(): number {
    return this.metrics.padding;
  }

  /** Room the copies behind take up above and to the left of the front. */
  public spread(node: DiagramNode): number {
    return (this.copies(node) - 1) * this.shift();
  }

  /** Size of the block with its copies, given the size of the front shape. */
  public outer(node: DiagramNode, front: Size): Size {
    const spread = this.spread(node);

    return { width: front.width + spread, height: front.height + spread };
  }

  /** The front shape inside the bounds of the whole block. */
  public front(node: DiagramNode, outer: Rect): Rect {
    const spread = this.spread(node);

    return {
      x: outer.x + spread,
      y: outer.y + spread,
      width: outer.width - spread,
      height: outer.height - spread,
    };
  }

  /** The front shape, for a block whose bounds start at the origin. */
  public frontAtOrigin(node: DiagramNode, outer: Size): Rect {
    return this.front(node, { x: 0, y: 0, ...outer });
  }
}
