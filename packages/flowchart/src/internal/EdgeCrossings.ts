import type { EdgeId, NodeId, Point } from "@rhumb/kernel";

export interface RoutedEdge {
  readonly id: EdgeId;
  readonly from: NodeId;
  readonly to: NodeId;
  readonly points: readonly Point[];
}

/** A place where a horizontal segment hops over a vertical line. */
export interface Hop {
  /** Index of the segment (points[segment] to points[segment + 1]). */
  readonly segment: number;
  readonly at: Point;
}

const EPSILON = 1e-6;

interface Segment {
  readonly edge: RoutedEdge;
  readonly index: number;
  readonly from: Point;
  readonly to: Point;
}

function isHorizontal(segment: Segment): boolean {
  return Math.abs(segment.from.y - segment.to.y) < EPSILON;
}

function isVertical(segment: Segment): boolean {
  return Math.abs(segment.from.x - segment.to.x) < EPSILON;
}

function between(value: number, a: number, b: number, margin: number): boolean {
  return value > Math.min(a, b) + margin && value < Math.max(a, b) - margin;
}

function segmentsOf(edge: RoutedEdge): readonly Segment[] {
  return edge.points.slice(1).flatMap((to, offset) => {
    const from = edge.points[offset];
    return from === undefined ? [] : [{ edge, index: offset, from, to }];
  });
}

/**
 * Finds places where two different lines cross each other. They are drawn
 * with an arch so that a crossing is not mistaken for a junction. Lines that
 * only touch, merge or run side by side are not crossings and never hop.
 */
export class CrossingFinder {
  public constructor(private readonly radius: number) {}

  public find(
    edges: readonly RoutedEdge[],
  ): ReadonlyMap<EdgeId, readonly Hop[]> {
    const found = new Map<EdgeId, Hop[]>();

    edges.forEach((first, i) => {
      for (const second of edges.slice(i + 1)) {
        for (const a of segmentsOf(first)) {
          for (const b of segmentsOf(second)) {
            this.cross(a, b, found);
          }
        }
      }
    });

    return this.spaced(found);
  }

  private cross(a: Segment, b: Segment, found: Map<EdgeId, Hop[]>): void {
    const horizontal =
      isHorizontal(a) && isVertical(b)
        ? a
        : isHorizontal(b) && isVertical(a)
          ? b
          : undefined;

    if (horizontal === undefined) {
      return;
    }

    const vertical = horizontal === a ? b : a;
    const x = vertical.from.x;
    const y = horizontal.from.y;
    const room = this.radius + EPSILON;

    if (
      !between(x, horizontal.from.x, horizontal.to.x, room) ||
      !between(y, vertical.from.y, vertical.to.y, EPSILON)
    ) {
      return;
    }

    const hops = found.get(horizontal.edge.id) ?? [];

    hops.push({ segment: horizontal.index, at: { x, y } });
    found.set(horizontal.edge.id, hops);
  }

  /** Orders hops along each line and drops those too close to the previous. */
  private spaced(
    found: ReadonlyMap<EdgeId, readonly Hop[]>,
  ): ReadonlyMap<EdgeId, readonly Hop[]> {
    const result = new Map<EdgeId, readonly Hop[]>();

    found.forEach((hops, id) => {
      const kept: Hop[] = [];
      const ordered = [...hops].sort(
        (p, q) => p.segment - q.segment || p.at.x - q.at.x,
      );

      for (const hop of ordered) {
        const previous = kept.at(-1);
        const clash =
          previous?.segment === hop.segment &&
          Math.abs(previous.at.x - hop.at.x) < this.radius * 2;

        if (!clash) {
          kept.push(hop);
        }
      }

      result.set(id, kept);
    });

    return result;
  }
}
