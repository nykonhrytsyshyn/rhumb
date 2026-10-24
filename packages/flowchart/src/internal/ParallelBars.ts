import type {
  EdgeId,
  FlowchartDiagram,
  LayoutResult,
  NodeId,
  Point,
  Rect,
  Shape,
} from "@rhumb/kernel";

import type { Metrics } from "./Metrics";
import { ParallelShape } from "./shapes";

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

/**
 * Stretches each bar of parallel actions over the lines that meet it, and lets
 * every line end on the bar straight, at its own point, instead of all of them
 * gathering at one port.
 */
export class ParallelBars {
  public constructor(private readonly metrics: Metrics) {}

  public stretch(
    diagram: FlowchartDiagram,
    shapes: ReadonlyMap<NodeId, Shape>,
    layout: LayoutResult,
  ): LayoutResult {
    const nodes = new Map(layout.nodes);
    const edges = new Map(layout.edges);

    for (const node of diagram.nodes) {
      const shape = shapes.get(node.id);

      if (node.kind === "parallel" && shape instanceof ParallelShape) {
        this.stretchOne(diagram, node.id, shape, nodes, edges);
      }
    }

    return { ...layout, nodes, edges };
  }

  private stretchOne(
    diagram: FlowchartDiagram,
    id: NodeId,
    shape: ParallelShape,
    nodes: Map<NodeId, Rect>,
    edges: Map<EdgeId, readonly Point[]>,
  ): void {
    const bar = nodes.get(id);

    if (bar === undefined) {
      return;
    }

    const upright = shape.isUpright;
    const across = (point: Point): number => (upright ? point.y : point.x);
    const flow = (point: Point): number => (upright ? point.x : point.y);
    const flowStart = upright ? bar.x : bar.y;
    const flowEnd = flowStart + (upright ? bar.width : bar.height);
    const attached = diagram.edges.flatMap((edge) => {
      const route = edges.get(edge.id);
      const incoming = edge.to === id;

      if ((!incoming && edge.from !== id) || edge.from === edge.to) {
        return [];
      }

      const end = incoming ? route?.[0] : route?.at(-1);
      const other = incoming ? edge.from : edge.to;

      // Only lines that come from clear of the bar can be drawn straight in.
      return end === undefined || (flow(end) > flowStart && flow(end) < flowEnd)
        ? []
        : [{ edge, incoming, end, other }];
    });

    if (attached.length === 0) {
      return;
    }

    const margin = this.metrics.grid;
    const from = Math.min(
      upright ? bar.y : bar.x,
      ...attached.map(({ end }) => across(end) - margin),
    );
    const to = Math.max(
      upright ? bar.y + bar.height : bar.x + bar.width,
      ...attached.map(({ end }) => across(end) + margin),
    );
    const wide: Rect = upright
      ? { ...bar, y: from, height: to - from }
      : { ...bar, x: from, width: to - from };

    const blocked = [...nodes].some(
      ([other, rect]) => other !== id && overlaps(rect, wide),
    );

    if (blocked) {
      return;
    }

    nodes.set(id, wide);

    const [first, second] = shape.pair(wide);
    const centre = flowStart + (flowEnd - flowStart) / 2;

    for (const { edge, incoming, end, other } of attached) {
      const line = flow(end) < centre ? first : second;
      const onBar: Point = upright
        ? { x: line, y: end.y }
        : { x: end.x, y: line };
      const hits = [...nodes].some(
        ([candidate, rect]) =>
          candidate !== id &&
          candidate !== other &&
          overlaps(rect, {
            x: Math.min(end.x, onBar.x) - 1,
            y: Math.min(end.y, onBar.y) - 1,
            width: Math.abs(end.x - onBar.x) + 2,
            height: Math.abs(end.y - onBar.y) + 2,
          }),
      );

      if (!hits) {
        edges.set(edge.id, incoming ? [end, onBar] : [onBar, end]);
      }
    }
  }
}
