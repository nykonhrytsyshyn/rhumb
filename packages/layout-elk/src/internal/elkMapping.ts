import type { ElkExtendedEdge, ElkNode, ElkPort } from "elkjs/lib/elk-api";

import {
  type LayoutDirection,
  type LayoutEdgeInput,
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

export function toElkGraph(request: LayoutRequest): ElkNode {
  return {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": ELK_DIRECTION[request.direction],
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.cycleBreaking.strategy": "DEPTH_FIRST",
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
      "elk.layered.nodePlacement.bk.fixedAlignment": "LEFTUP",
      "elk.padding": "[top=0,left=0,bottom=0,right=0]",
      "elk.spacing.nodeNode": String(request.nodeSpacing),
      "elk.layered.spacing.nodeNodeBetweenLayers": String(request.layerSpacing),
      "elk.spacing.edgeNode": String(request.edgeClearance),
      "elk.layered.spacing.edgeNodeBetweenLayers": String(
        request.edgeClearance,
      ),
      "elk.spacing.edgeEdge": String(request.edgeSpacing),
      "elk.layered.spacing.edgeEdgeBetweenLayers": String(request.edgeSpacing),
    },
    children: request.nodes.map((node, index) => toElkNode(node, index)),
    edges: request.edges.map((edge) => toElkEdge(edge)),
  };
}
