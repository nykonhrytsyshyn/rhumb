import {
  type DiagramEdge,
  type DiagramNode,
  type EdgeId,
  type FlowchartDiagram,
  type LayoutResult,
  type NodeId,
  type NoteSide,
  type Point,
  type Rect,
  type Shape,
  Side,
} from "@rhumb/kernel";

import type { Metrics } from "./Metrics";
import { NodeFrame } from "./NodeFrame";
import type { NodeSizer } from "./NodeSizer";
import { CommentShape } from "./shapes";

/** Points where a note may be tied, by the side of the block they lie on. */
type Anchor = Readonly<Record<Side, readonly Point[]>>;

/** How many times a note is pushed further out before the search gives up. */
const MAX_PUSHES = 6;

interface Placement {
  readonly note: DiagramNode;
  readonly link: DiagramEdge;
  readonly anchorId: string;
  readonly from: Point;
  readonly spot: Spot;
}

interface Spot {
  readonly rect: Rect;
  /** Where the dashed line meets the note. */
  readonly end: Point;
  /** The side of the note that faces the block. */
  readonly towards: Side;
}

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

function contains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

function grow(rect: Rect, by: number): Rect {
  return {
    x: rect.x - by,
    y: rect.y - by,
    width: rect.width + by * 2,
    height: rect.height + by * 2,
  };
}

/** The box around a straight segment, a little fattened to count touches. */
function boxOf(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x) - 0.5,
    y: Math.min(a.y, b.y) - 0.5,
    width: Math.abs(a.x - b.x) + 1,
    height: Math.abs(a.y - b.y) + 1,
  };
}

/**
 * Places the notes of a diagram once the rest of it has been laid out. A
 * note sits beside the block or frame it explains, as near as it can without
 * landing on anything, and is joined to it with a dashed line.
 */
export class AnnotationPlacer {
  private readonly frame: NodeFrame;

  public constructor(
    private readonly metrics: Metrics,
    private readonly sizer: NodeSizer,
  ) {
    this.frame = new NodeFrame(metrics);
  }

  /** The diagram as the layout sees it: the notes are set apart. */
  public static withoutNotes(diagram: FlowchartDiagram): FlowchartDiagram {
    const notes = new Set(
      diagram.nodes
        .filter((node) => node.kind === "comment")
        .map((node) => node.id),
    );

    return {
      ...diagram,
      nodes: diagram.nodes.filter((node) => !notes.has(node.id)),
      edges: diagram.edges.filter(
        (edge) => !notes.has(edge.from) && !notes.has(edge.to),
      ),
    };
  }

  public place(
    diagram: FlowchartDiagram,
    shapes: ReadonlyMap<NodeId, Shape>,
    layout: LayoutResult,
  ): LayoutResult {
    const notes = diagram.nodes.filter((node) => node.kind === "comment");

    if (notes.length === 0) {
      return layout;
    }

    const nodes = new Map(layout.nodes);
    const edges = new Map(layout.edges);
    let { width, height } = layout.size;
    const placed: Placement[] = [];

    for (const note of notes) {
      const link = diagram.edges.find(
        (edge) => edge.from === note.id || edge.to === note.id,
      );
      const shape = shapes.get(note.id);

      if (link === undefined || !(shape instanceof CommentShape)) {
        continue;
      }

      const anchorId = link.from === note.id ? link.to : link.from;
      const anchor = this.anchorOf(diagram, shapes, layout, nodes, anchorId);

      if (anchor === undefined) {
        continue;
      }

      const size = this.sizer.size(note, shape);
      const { spot, from } = this.choose(
        diagram,
        anchor,
        anchorId,
        size,
        nodes,
        layout,
        edges,
        note.side,
      );

      shape.face(spot.towards);
      nodes.set(note.id, spot.rect);
      edges.set(link.id, AnnotationPlacer.line(link, note, from, spot));
      placed.push({ note, link, anchorId, from, spot });
    }

    this.align(placed, nodes, edges, layout);

    for (const rect of placed.map(({ note }) => nodes.get(note.id))) {
      if (rect !== undefined) {
        width = Math.max(width, rect.x + rect.width);
        height = Math.max(height, rect.y + rect.height);
      }
    }

    return { ...layout, nodes, edges, size: { width, height } };
  }

  /**
   * Notes that stand on the same side line up: they are moved outwards, never
   * inwards, until their bracket sits on one line, where nothing is in the way.
   */
  private align(
    placed: readonly Placement[],
    nodes: Map<NodeId, Rect>,
    edges: Map<EdgeId, readonly Point[]>,
    layout: LayoutResult,
  ): void {
    for (const side of [Side.Left, Side.Right, Side.Top, Side.Bottom]) {
      const row = placed.filter(({ spot }) => spot.towards === side);

      if (row.length < 2) {
        continue;
      }

      // The edge of a note that faces its block, on the axis it is moved along.
      const near = (rect: Rect): number =>
        side === Side.Left
          ? rect.x
          : side === Side.Right
            ? rect.x + rect.width
            : side === Side.Top
              ? rect.y
              : rect.y + rect.height;
      const outward = side === Side.Left || side === Side.Top ? 1 : -1;
      const target = row.reduce(
        (best, { note }) => {
          const rect = nodes.get(note.id);

          return rect === undefined
            ? best
            : outward === 1
              ? Math.max(best, near(rect))
              : Math.min(best, near(rect));
        },
        outward === 1 ? -Infinity : Infinity,
      );

      for (const item of row) {
        const rect = nodes.get(item.note.id);

        if (rect === undefined) {
          continue;
        }

        const move = target - near(rect);
        const horizontal = side === Side.Left || side === Side.Right;
        const moved: Rect = horizontal
          ? { ...rect, x: rect.x + move }
          : { ...rect, y: rect.y + move };
        const end: Point = horizontal
          ? { x: near(moved), y: item.spot.end.y }
          : { x: item.spot.end.x, y: near(moved) };

        if (
          move === 0 ||
          this.crowd(
            moved,
            boxOf(item.from, end),
            item.anchorId,
            item.note.id,
            item.link.id,
            nodes,
            layout,
            edges,
          ) > 0
        ) {
          continue;
        }

        nodes.set(item.note.id, moved);
        edges.set(
          item.link.id,
          item.link.from === item.note.id ? [end, item.from] : [item.from, end],
        );
      }
    }
  }

  /** How many things a note, and the line that joins it, would land on. */
  private crowd(
    rect: Rect,
    wire: Rect,
    anchorId: string,
    noteId: string,
    ownEdge: EdgeId,
    nodes: ReadonlyMap<NodeId, Rect>,
    layout: LayoutResult,
    edges: ReadonlyMap<EdgeId, readonly Point[]>,
  ): number {
    const clear = this.metrics.clearance / 2;
    const frames = [...(layout.groups ?? [])].filter(([id]) => id !== anchorId);
    const segments = [...edges]
      .filter(([id]) => id !== ownEdge)
      .flatMap(([, points]) =>
        points
          .slice(1)
          .map((point, index) => boxOf(points[index] ?? point, point)),
      );

    return (
      [...nodes].filter(
        ([id, other]) =>
          id !== anchorId &&
          id !== noteId &&
          overlaps(grow(other, clear), rect),
      ).length +
      frames.filter(
        ([, frame]) => overlaps(frame, rect) && !contains(frame, rect),
      ).length +
      segments.filter(
        (box) => overlaps(box, grow(rect, 1)) || overlaps(box, wire),
      ).length
    );
  }

  private static readonly SIDES: Readonly<Record<NoteSide, Side>> = {
    right: Side.Right,
    left: Side.Left,
    top: Side.Top,
    bottom: Side.Bottom,
  };

  private static line(
    link: DiagramEdge,
    note: DiagramNode,
    start: Point,
    spot: Spot,
  ): readonly Point[] {
    return link.from === note.id ? [spot.end, start] : [start, spot.end];
  }

  /** Where a note can be tied to the block or frame it belongs to, per side. */
  private anchorOf(
    diagram: FlowchartDiagram,
    shapes: ReadonlyMap<NodeId, Shape>,
    layout: LayoutResult,
    nodes: ReadonlyMap<NodeId, Rect>,
    id: string,
  ): Anchor | undefined {
    const block = diagram.nodes.find((node) => node.id === id);
    const bounds = nodes.get(id);
    const every = (points: (side: Side) => readonly Point[]): Anchor => ({
      [Side.Top]: points(Side.Top),
      [Side.Right]: points(Side.Right),
      [Side.Bottom]: points(Side.Bottom),
      [Side.Left]: points(Side.Left),
    });

    if (block !== undefined && bounds !== undefined) {
      const shape = shapes.get(id);
      const front = this.frame.front(block, bounds);

      return every((side) =>
        shape === undefined
          ? [AnnotationPlacer.middle(front, side)]
          : shape.notePoints(front, side),
      );
    }

    const frame = layout.groups?.get(id);

    return frame === undefined
      ? undefined
      : every((side) => [AnnotationPlacer.middle(frame, side)]);
  }

  private static middle(rect: Rect, side: Side): Point {
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;

    switch (side) {
      case Side.Top:
        return { x: cx, y: rect.y };
      case Side.Right:
        return { x: rect.x + rect.width, y: cy };
      case Side.Bottom:
        return { x: cx, y: rect.y + rect.height };
      case Side.Left:
        return { x: rect.x, y: cy };
    }
  }

  private choose(
    diagram: FlowchartDiagram,
    anchor: Anchor,
    anchorId: string,
    size: { readonly width: number; readonly height: number },
    nodes: ReadonlyMap<NodeId, Rect>,
    layout: LayoutResult,
    edges: ReadonlyMap<EdgeId, readonly Point[]>,
    wanted: NoteSide | undefined,
  ): { readonly spot: Spot; readonly from: Point } {
    const sides =
      wanted !== undefined
        ? [AnnotationPlacer.SIDES[wanted]]
        : diagram.direction === "TB" || diagram.direction === "BT"
          ? [Side.Right, Side.Left]
          : [Side.Top, Side.Bottom];
    const obstacles = [...nodes]
      .filter(([id]) => id !== anchorId)
      .map(([, rect]) => grow(rect, this.metrics.clearance / 2));
    const frames = [...(layout.groups ?? [])]
      .filter(([id]) => id !== anchorId)
      .map(([, rect]) => rect);
    const segments = [...edges.values()].flatMap((points) =>
      points
        .slice(1)
        .map((point, index) => boxOf(points[index] ?? point, point)),
    );
    let best: { spot: Spot; from: Point; cost: number } | undefined;

    for (let push = 0; push <= MAX_PUSHES; push += 1) {
      const gap = this.metrics.noteGap + push * this.metrics.grid;

      for (const side of sides) {
        for (const from of anchor[side]) {
          const spot = AnnotationPlacer.spot(side, from, size, gap);
          const wire = boxOf(from, spot.end);
          const cost =
            obstacles.filter((rect) => overlaps(rect, spot.rect)).length +
            frames.filter(
              (rect) => overlaps(rect, spot.rect) && !contains(rect, spot.rect),
            ).length +
            segments.filter(
              (box) => overlaps(box, grow(spot.rect, 1)) || overlaps(box, wire),
            ).length;

          if (best === undefined || cost < best.cost) {
            best = { spot, from, cost };
          }

          if (cost === 0) {
            return { spot, from };
          }
        }
      }
    }

    const origin = { x: 0, y: 0 };

    return (
      best ?? {
        spot: AnnotationPlacer.spot(sides[0] ?? Side.Right, origin, size, 0),
        from: origin,
      }
    );
  }

  private static spot(
    side: Side,
    from: Point,
    size: { readonly width: number; readonly height: number },
    gap: number,
  ): Spot {
    const { width, height } = size;

    switch (side) {
      case Side.Right: {
        const rect = { x: from.x + gap, y: from.y - height / 2, width, height };

        return { rect, end: { x: rect.x, y: from.y }, towards: Side.Left };
      }
      case Side.Left: {
        const rect = {
          x: from.x - gap - width,
          y: from.y - height / 2,
          width,
          height,
        };

        return {
          rect,
          end: { x: rect.x + width, y: from.y },
          towards: Side.Right,
        };
      }
      case Side.Top: {
        const rect = {
          x: from.x - width / 2,
          y: from.y - gap - height,
          width,
          height,
        };

        return {
          rect,
          end: { x: from.x, y: rect.y + height },
          towards: Side.Bottom,
        };
      }
      case Side.Bottom: {
        const rect = { x: from.x - width / 2, y: from.y + gap, width, height };

        return { rect, end: { x: from.x, y: rect.y }, towards: Side.Top };
      }
    }
  }
}
