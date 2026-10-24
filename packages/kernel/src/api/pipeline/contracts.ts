import type {
  Diagram,
  EdgeId,
  GroupId,
  NodeId,
  Point,
  Rect,
  Side,
  Size,
} from "../model";
import type { Port } from "../shape";

export interface DiagramParser<T extends Diagram = Diagram> {
  /** @throws DiagramSyntaxError when the source cannot be parsed. */
  parse(source: string): T;
}

export type LayoutDirection = "down" | "up" | "right" | "left";

export interface LayoutNodeInput {
  readonly id: NodeId;
  readonly size: Size;
  /** Ports with positions relative to the node's top-left corner. */
  readonly ports: readonly Port[];
  /** The innermost frame the node sits in. */
  readonly group?: GroupId;
}

/** A frame that keeps its members together; frames can nest. */
export interface LayoutGroupInput {
  readonly id: GroupId;
  readonly parent?: GroupId;
  /** Free space between the frame and what it holds. */
  readonly padding: {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
  };
}

export interface LayoutEdgeInput {
  readonly id: EdgeId;
  readonly from: NodeId;
  readonly to: NodeId;
  readonly fromSide: Side;
  readonly toSide: Side;
}

export interface LayoutRequest {
  readonly direction: LayoutDirection;
  readonly nodeSpacing: number;
  readonly layerSpacing: number;
  readonly edgeClearance: number;
  readonly edgeSpacing: number;
  readonly nodes: readonly LayoutNodeInput[];
  readonly edges: readonly LayoutEdgeInput[];
  readonly groups?: readonly LayoutGroupInput[];
  /**
   * Put every block in the first row it can be in, so that blocks that follow
   * the same block share a row (needed for a bar of parallel actions to reach
   * all of them).
   */
  readonly earlyRows?: boolean;
}

export interface LayoutResult {
  readonly nodes: ReadonlyMap<NodeId, Rect>;
  readonly edges: ReadonlyMap<EdgeId, readonly Point[]>;
  /** Bounds of every frame, in the same coordinates as the nodes. */
  readonly groups?: ReadonlyMap<GroupId, Rect>;
  readonly size: Size;
}

export interface LayoutEngine {
  layout(request: LayoutRequest): Promise<LayoutResult>;
}
