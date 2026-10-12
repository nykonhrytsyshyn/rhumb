export type NodeId = string;
export type EdgeId = string;

export type DiagramType = "flowchart";

export const NODE_KINDS = [
  "process",
  "decision",
  "terminator",
  "io",
  "preparation",
  "predefinedProcess",
  "connector",
] as const;

/** Semantic meaning of a block, independent of the source syntax. */
export type NodeKind = (typeof NODE_KINDS)[number];

export type LineStyle = "solid" | "dashed" | "thick";

export type Direction = "TB" | "BT" | "LR" | "RL";

export interface DiagramNode {
  readonly id: NodeId;
  readonly kind: NodeKind;
  readonly label: string;
}

export interface DiagramEdge {
  readonly id: EdgeId;
  readonly from: NodeId;
  readonly to: NodeId;
  readonly label: string | undefined;
  readonly line: LineStyle;
  readonly arrow: boolean;
}

export interface Diagram {
  readonly type: DiagramType;
  readonly nodes: readonly DiagramNode[];
  readonly edges: readonly DiagramEdge[];
}

export interface FlowchartDiagram extends Diagram {
  readonly type: "flowchart";
  readonly direction: Direction;
}
