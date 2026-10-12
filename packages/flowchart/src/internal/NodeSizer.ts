import {
  type DiagramNode,
  type Shape,
  type Size,
  type TextMeasurer,
  snapUp,
} from "@rhumb/kernel";

import type { Metrics } from "./Metrics";

/** Computes block sizes from their text, the shape and the profile. */
export class NodeSizer {
  public constructor(
    private readonly metrics: Metrics,
    private readonly measurer: TextMeasurer,
  ) {}

  public size(node: DiagramNode, shape: Shape): Size {
    const { metrics } = this;
    const text = this.measurer.measure(node.label, metrics.textStyle);
    const preferred = shape.measure({
      width: text.width + metrics.padding * 2,
      height: text.height + metrics.padding * 2,
    });
    const minimum = metrics.minimum(node.kind);

    return {
      width: snapUp(Math.max(preferred.width, minimum.width), metrics.grid),
      height: snapUp(Math.max(preferred.height, minimum.height), metrics.grid),
    };
  }
}
