import type { ELK, ElkNode } from "elkjs/lib/elk-api";

import {
  type EdgeId,
  type LayoutEngine,
  type LayoutRequest,
  type LayoutResult,
  type NodeId,
  type Point,
  type Rect,
} from "@rhumb/kernel";

import { toElkGraph } from "../../internal/elkMapping";

/** Layered layout with fixed ports and orthogonal edge routing. */
export class ElkLayoutEngine implements LayoutEngine {
  public constructor(private readonly elk: ELK) {}

  public async layout(request: LayoutRequest): Promise<LayoutResult> {
    const graph = await this.elk.layout(toElkGraph(request));

    return {
      nodes: ElkLayoutEngine.readNodes(graph),
      edges: ElkLayoutEngine.readEdges(graph),
      size: { width: graph.width ?? 0, height: graph.height ?? 0 },
    };
  }

  private static readNodes(graph: ElkNode): ReadonlyMap<NodeId, Rect> {
    const result = new Map<NodeId, Rect>();

    for (const child of graph.children ?? []) {
      result.set(child.id, {
        x: child.x ?? 0,
        y: child.y ?? 0,
        width: child.width ?? 0,
        height: child.height ?? 0,
      });
    }

    return result;
  }

  private static readEdges(
    graph: ElkNode,
  ): ReadonlyMap<EdgeId, readonly Point[]> {
    const result = new Map<EdgeId, readonly Point[]>();

    for (const edge of graph.edges ?? []) {
      const points = (edge.sections ?? []).flatMap((section) => [
        section.startPoint,
        ...(section.bendPoints ?? []),
        section.endPoint,
      ]);

      result.set(edge.id, points);
    }

    return result;
  }
}
