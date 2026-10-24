export type NodeId = string;
export type EdgeId = string;
export type GroupId = string;

export type DiagramType = "flowchart";

export const NODE_KINDS = [
  "process",
  "decision",
  "terminator",
  "io",
  "preparation",
  "predefinedProcess",
  "connector",
  "storedData",
  "internalStorage",
  "sequentialStorage",
  "directStorage",
  "document",
  "paperTape",
  "manualInput",
  "card",
  "display",
  "manualOperation",
  "parallel",
  "loopStart",
  "loopEnd",
  "transfer",
  "comment",
] as const;

/** Semantic meaning of a block, independent of the source syntax. */
export type NodeKind = (typeof NODE_KINDS)[number];

/** The side of a block a comment is placed on. */
export type NoteSide = "right" | "left" | "top" | "bottom";

export type LineStyle = "solid" | "dashed" | "thick";

export type Direction = "TB" | "BT" | "LR" | "RL";

export interface DiagramNode {
  readonly id: NodeId;
  readonly kind: NodeKind;
  readonly label: string;
  /** Symbol identifier, drawn above the block on the left (ISO 5807, 4.1.5). */
  readonly ident?: string;
  /** Symbol description, drawn above the block on the right (4.1.6, 4.1.7). */
  readonly desc?: string;
  /** Description of an input, drawn below the block on the right (4.1.7). */
  readonly input?: string;
  /** Reference to a detailed representation: draws the stripe (4.1.8). */
  readonly ref?: string;
  /** Number of overlapping copies of the block (4.3.2); 1 when absent. */
  readonly stack?: number;
  /** Name that joins the two parts of a loop limit. */
  readonly loop?: string;
  /** For a transfer of control: what its letter stands for, written under the diagram. */
  readonly legend?: string;
  /** For a comment: the side of its block it stands on, when not left to the layout. */
  readonly side?: NoteSide;
  /** The innermost frame the block sits in. */
  readonly group?: GroupId;
}

export interface DiagramEdge {
  readonly id: EdgeId;
  /** A block, or a frame when the other end is a comment. */
  readonly from: NodeId;
  readonly to: NodeId;
  readonly label: string | undefined;
  readonly line: LineStyle;
  readonly arrow: boolean;
  /** The line carries the omission symbol (three dots) instead of a label. */
  readonly skip: boolean;
  /** The line carries the communication-link symbol (a zigzag) in its middle. */
  readonly channel: boolean;
}

/** A dashed frame around a part of a diagram. */
export interface DiagramGroup {
  readonly id: GroupId;
  readonly title: string | undefined;
  readonly parent: GroupId | undefined;
}

export interface Diagram {
  readonly type: DiagramType;
  readonly nodes: readonly DiagramNode[];
  readonly edges: readonly DiagramEdge[];
  readonly groups: readonly DiagramGroup[];
}

export interface FlowchartDiagram extends Diagram {
  readonly type: "flowchart";
  readonly direction: Direction;
}
