import type {
  Diagram,
  EdgeId,
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
  readonly nodes: readonly LayoutNodeInput[];
  readonly edges: readonly LayoutEdgeInput[];
}

export interface LayoutResult {
  readonly nodes: ReadonlyMap<NodeId, Rect>;
  readonly edges: ReadonlyMap<EdgeId, readonly Point[]>;
  readonly size: Size;
}

export interface LayoutEngine {
  layout(request: LayoutRequest): Promise<LayoutResult>;
}
