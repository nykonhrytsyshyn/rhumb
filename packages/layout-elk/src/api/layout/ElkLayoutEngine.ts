import type { ELK, ElkExtendedEdge, ElkNode } from "elkjs/lib/elk-api";

import {
  type EdgeId,
  type GroupId,
  type LayoutEngine,
  type LayoutRequest,
  type LayoutResult,
  type NodeId,
  type Point,
  type Rect,
} from "@rhumb/kernel";

import {
  ELK_ATTEMPTS,
  type ElkAttempt,
  toElkGraph,
} from "../../internal/elkMapping";

interface Tree {
  readonly nodes: Map<NodeId, Rect>;
  readonly groups: Map<GroupId, Rect>;
  /** Absolute position of every container, by id. */
  readonly origins: Map<string, Point>;
}

/** Layered layout with fixed ports and orthogonal edge routing. */
export class ElkLayoutEngine implements LayoutEngine {
  public constructor(private readonly elk: ELK) {}

  public async layout(request: LayoutRequest): Promise<LayoutResult> {
    const framed = (request.groups?.length ?? 0) > 0;
    const attempts = framed
      ? ELK_ATTEMPTS
      : ELK_ATTEMPTS.slice(0, 2).filter((attempt) => attempt.hierarchy);
    let failure: unknown;

    for (const attempt of attempts) {
      try {
        return await this.run(request, attempt);
      } catch (error) {
        failure = error;
      }
    }

    throw failure;
  }

  private async run(
    request: LayoutRequest,
    attempt: ElkAttempt,
  ): Promise<LayoutResult> {
    const graph = await this.elk.layout(toElkGraph(request, attempt));
    const framed = new Set(
      attempt.hierarchy ? (request.groups ?? []).map((group) => group.id) : [],
    );
    const tree = ElkLayoutEngine.readTree(graph, framed);
    const groups = attempt.hierarchy
      ? tree.groups
      : ElkLayoutEngine.frameAround(request, tree.nodes);

    return {
      nodes: tree.nodes,
      edges: ElkLayoutEngine.readEdges(graph, tree.origins),
      groups,
      size: { width: graph.width ?? 0, height: graph.height ?? 0 },
    };
  }

  /** Frames drawn around their members, when ELK could not lay them out. */
  private static frameAround(
    request: LayoutRequest,
    nodes: ReadonlyMap<NodeId, Rect>,
  ): Map<GroupId, Rect> {
    const frames = new Map<GroupId, Rect>();
    const groups = request.groups ?? [];
    const around = (id: GroupId): Rect | undefined => {
      const known = frames.get(id);

      if (known !== undefined) {
        return known;
      }

      const group = groups.find((candidate) => candidate.id === id);

      if (group === undefined) {
        return undefined;
      }

      const parts = [
        ...request.nodes
          .filter((node) => node.group === id)
          .map((node) => nodes.get(node.id)),
        ...groups
          .filter((candidate) => candidate.parent === id)
          .map((candidate) => around(candidate.id)),
      ].filter((part): part is Rect => part !== undefined);

      if (parts.length === 0) {
        return undefined;
      }

      const { top, right, bottom, left } = group.padding;
      const x = Math.min(...parts.map((part) => part.x)) - left;
      const y = Math.min(...parts.map((part) => part.y)) - top;
      const frame = {
        x,
        y,
        width:
          Math.max(...parts.map((part) => part.x + part.width)) + right - x,
        height:
          Math.max(...parts.map((part) => part.y + part.height)) + bottom - y,
      };

      frames.set(id, frame);

      return frame;
    };

    for (const group of groups) {
      around(group.id);
    }

    return frames;
  }

  private static readTree(graph: ElkNode, framed: ReadonlySet<string>): Tree {
    const tree: Tree = {
      nodes: new Map(),
      groups: new Map(),
      origins: new Map([[graph.id, { x: 0, y: 0 }]]),
    };

    const visit = (parent: ElkNode, origin: Point): void => {
      for (const child of parent.children ?? []) {
        const x = origin.x + (child.x ?? 0);
        const y = origin.y + (child.y ?? 0);
        const rect = {
          x,
          y,
          width: child.width ?? 0,
          height: child.height ?? 0,
        };

        tree.origins.set(child.id, { x, y });

        if (framed.has(child.id)) {
          tree.groups.set(child.id, rect);
          visit(child, { x, y });
        } else {
          tree.nodes.set(child.id, rect);
        }
      }
    };

    visit(graph, { x: 0, y: 0 });

    return tree;
  }

  private static readEdges(
    graph: ElkNode,
    origins: ReadonlyMap<string, Point>,
  ): ReadonlyMap<EdgeId, readonly Point[]> {
    const result = new Map<EdgeId, readonly Point[]>();

    for (const edge of ElkLayoutEngine.allEdges(graph)) {
      const origin = origins.get(edge.container ?? graph.id) ?? {
        x: 0,
        y: 0,
      };
      const points = (edge.sections ?? [])
        .flatMap((section) => [
          section.startPoint,
          ...(section.bendPoints ?? []),
          section.endPoint,
        ])
        .map((point) => ({ x: point.x + origin.x, y: point.y + origin.y }));

      result.set(edge.id, points);
    }

    return result;
  }

  /** Edges can be reported by the root or by any frame that holds them. */
  private static allEdges(node: ElkNode): readonly ElkExtendedEdge[] {
    return [
      ...(node.edges ?? []),
      ...(node.children ?? []).flatMap((child) =>
        ElkLayoutEngine.allEdges(child),
      ),
    ];
  }
}
