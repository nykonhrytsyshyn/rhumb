import {
  type DiagramNode,
  type Shape,
  type Size,
  type TextMeasurer,
  snapUp,
} from "@rhumb/kernel";

import type { Metrics } from "./Metrics";
import { NodeFrame } from "./NodeFrame";
import { ParallelShape } from "./shapes";

/** Computes block sizes from their text, the shape and the profile. */
export class NodeSizer {
  private readonly frame: NodeFrame;

  public constructor(
    private readonly metrics: Metrics,
    private readonly measurer: TextMeasurer,
  ) {
    this.frame = new NodeFrame(metrics);
  }

  /** Size of the whole block: the shape, its stripe and the copies behind. */
  public size(node: DiagramNode, shape: Shape): Size {
    const { metrics } = this;
    const text = shape.showsText
      ? this.measurer.measure(node.label, metrics.textStyle)
      : { width: 0, height: 0 };
    const padding = shape.compact ? metrics.padding / 2 : metrics.padding;
    const preferred = shape.measure({
      width: text.width + padding * 2,
      height: text.height + padding * 2,
    });
    const base = metrics.minimum(node.kind);
    const minimum = shape.turned
      ? { width: base.height, height: base.width }
      : base;
    const reference =
      node.ref === undefined
        ? 0
        : this.measurer.measure(node.ref, metrics.textStyle).width +
          metrics.padding * 2;
    const front = this.frontSize(node, shape, preferred, minimum, reference);

    return this.frame.outer(node, front);
  }

  private frontSize(
    node: DiagramNode,
    shape: Shape,
    preferred: Size,
    minimum: Size,
    reference: number,
  ): Size {
    const { metrics } = this;

    if (shape.proportional) {
      const scale = Math.max(
        1,
        minimum.width / preferred.width,
        minimum.height / preferred.height,
      );

      return {
        width: preferred.width * scale,
        height: preferred.height * scale,
      };
    }

    if (shape.ownThickness) {
      const length = snapUp(
        shape.turned ? minimum.height : minimum.width,
        metrics.grid,
      );
      const thickness = shape instanceof ParallelShape ? shape.thickness : 0;

      return shape.turned
        ? { width: thickness, height: length }
        : { width: length, height: thickness };
    }

    return {
      width: snapUp(
        Math.max(preferred.width, minimum.width, reference),
        metrics.grid,
      ),
      height: snapUp(
        Math.max(preferred.height + this.frame.band(node), minimum.height),
        metrics.grid,
      ),
    };
  }
}
