import type { ElkExtendedEdge, ElkNode, ElkPort } from "elkjs/lib/elk-api";

import {
  type LayoutDirection,
  type LayoutEdgeInput,
  type LayoutGroupInput,
  type LayoutNodeInput,
  type LayoutRequest,
  Side,
} from "@rhumb/kernel";

const ELK_SIDE: Readonly<Record<Side, string>> = {
  [Side.Top]: "NORTH",
  [Side.Right]: "EAST",
  [Side.Bottom]: "SOUTH",
  [Side.Left]: "WEST",
};

const ELK_DIRECTION: Readonly<Record<LayoutDirection, string>> = {
  down: "DOWN",
  up: "UP",
  right: "RIGHT",
  left: "LEFT",
};

export function portId(nodeId: string, side: Side): string {
  return `${nodeId}:${side}`;
}

function toElkPort(node: LayoutNodeInput, index: number): readonly ElkPort[] {
  return node.ports.map((port) => ({
    id: portId(node.id, port.side),
    x: port.position.x,
    y: port.position.y,
    width: 0,
    height: 0,
    layoutOptions: {
      "elk.port.side": ELK_SIDE[port.side],
      "elk.port.index": String(index),
    },
  }));
}

function toElkNode(node: LayoutNodeInput, index: number): ElkNode {
  return {
    id: node.id,
    width: node.size.width,
    height: node.size.height,
    layoutOptions: { "elk.portConstraints": "FIXED_POS" },
    ports: [...toElkPort(node, index)],
  };
}

function toElkEdge(edge: LayoutEdgeInput): ElkExtendedEdge {
  return {
    id: edge.id,
    sources: [portId(edge.from, edge.fromSide)],
    targets: [portId(edge.to, edge.toSide)],
  };
}

function toElkGroup(
  group: LayoutGroupInput,
  children: readonly ElkNode[],
  shared: Record<string, string>,
): ElkNode {
  const { top, right, bottom, left } = group.padding;

  return {
    id: group.id,
    layoutOptions: {
      ...shared,
      "elk.padding": `[top=${String(top)},left=${String(left)},bottom=${String(bottom)},right=${String(right)}]`,
    },
    children: [...children],
  };
}

/**
 * Nests the nodes in their frames. Frames that are not inside another frame
 * and nodes that sit in none are the children of the root.
 */
function nest(request: LayoutRequest): readonly ElkNode[] {
  const groups = request.groups ?? [];
  const known = new Set(groups.map((group) => group.id));
  const shared = sharedOptions(request);
  const inside = (parent: string | undefined): readonly ElkNode[] => [
    ...groups
      .filter((group) => (group.parent ?? undefined) === parent)
      .map((group) => toElkGroup(group, inside(group.id), shared)),
    ...request.nodes
      .map((node, index) => ({ node, index }))
      .filter(
        ({ node }) =>
          (node.group !== undefined && known.has(node.group)
            ? node.group
            : undefined) === parent,
      )
      .map(({ node, index }) => toElkNode(node, index)),
  ];

  return inside(undefined);
}

/**
 * Options that every level of the drawing needs. They are repeated on each
 * frame: a frame lays out its members with its own options, so without them
 * the blocks inside would be packed with ELK's defaults.
 */
function sharedOptions(request: LayoutRequest): Record<string, string> {
  return {
    "elk.algorithm": "layered",
    "elk.direction": ELK_DIRECTION[request.direction],
    "elk.edgeRouting": "ORTHOGONAL",
    ...(request.earlyRows === true
      ? { "elk.layered.layering.strategy": "LONGEST_PATH_SOURCE" }
      : {}),
    "elk.layered.cycleBreaking.strategy": "DEPTH_FIRST",
    "elk.layered.nodePlacement.bk.fixedAlignment": "LEFTUP",
    "elk.spacing.nodeNode": String(request.nodeSpacing),
    "elk.layered.spacing.nodeNodeBetweenLayers": String(request.layerSpacing),
    "elk.spacing.edgeNode": String(request.edgeClearance),
    "elk.layered.spacing.edgeNodeBetweenLayers": String(request.edgeClearance),
    "elk.spacing.edgeEdge": String(request.edgeSpacing),
    "elk.layered.spacing.edgeEdgeBetweenLayers": String(request.edgeSpacing),
  };
}

/** Ways to ask ELK, from the best layout to the safest. */
export interface ElkAttempt {
  /** Keep blocks in the order of the source where ELK is free to choose. */
  readonly modelOrder: boolean;
  /** Lay frames out as part of the graph; without it they are drawn around their members afterwards. */
  readonly hierarchy: boolean;
}

export const ELK_ATTEMPTS: readonly ElkAttempt[] = [
  { modelOrder: true, hierarchy: true },
  { modelOrder: false, hierarchy: true },
  { modelOrder: false, hierarchy: false },
];

export function toElkGraph(
  request: LayoutRequest,
  attempt: ElkAttempt = { modelOrder: true, hierarchy: true },
): ElkNode {
  const framed = attempt.hierarchy && (request.groups?.length ?? 0) > 0;

  return {
    id: "root",
    layoutOptions: {
      ...sharedOptions(request),
      ...(framed ? { "elk.hierarchyHandling": "INCLUDE_CHILDREN" } : {}),
      // Model order is set on the root only: with frames, ELK fails when
      // every level asks for it.
      ...(attempt.modelOrder
        ? { "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES" }
        : {}),
      "elk.padding": "[top=0,left=0,bottom=0,right=0]",
    },
    children: [...nest(framed ? request : { ...request, groups: [] })],
    edges: request.edges.map((edge) => toElkEdge(edge)),
  };
}
