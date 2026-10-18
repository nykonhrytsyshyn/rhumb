import type { LayoutResult, Point, Rect } from "@rhumb/kernel";

type Axis = "x" | "y";

export interface Stretch {
  /** The stretch of a line that has to grow. */
  readonly from: Point;
  readonly to: Point;
  /** How much longer it has to become. */
  readonly extra: number;
}

const EPSILON = 1e-3;

function span(rect: Rect, axis: Axis): readonly [number, number] {
  return axis === "x"
    ? [rect.x, rect.x + rect.width]
    : [rect.y, rect.y + rect.height];
}

/**
 * A coordinate between `low` and `high` that no block reaches over: the
 * middle of the widest stretch there that is clear of blocks.
 */
function clearCoordinate(
  rects: Iterable<Rect>,
  axis: Axis,
  low: number,
  high: number,
): number | undefined {
  const blocked = [...rects]
    .map((rect) => span(rect, axis))
    .filter(([start, end]) => end > low + EPSILON && start < high - EPSILON)
    .sort((a, b) => a[0] - b[0]);
  let best: { start: number; end: number } | undefined;
  let cursor = low;

  for (const [start, end] of [...blocked, [high, high] as const]) {
    if (start - cursor > (best ? best.end - best.start : EPSILON)) {
      best = { start: cursor, end: start };
    }

    cursor = Math.max(cursor, end);
  }

  return best === undefined ? undefined : (best.start + best.end) / 2;
}

/**
 * Makes room by cutting the diagram across a line and moving everything
 * on its far side away: the line grows by `extra` and the diagram with it.
 * Everything on the positive side of the cut moves, so no coordinate
 * becomes negative. Returns nothing when blocks leave no place to cut.
 */
export function openGap(
  layout: LayoutResult,
  stretch: Stretch,
): LayoutResult | undefined {
  const { from, to, extra } = stretch;
  const axis: Axis = Math.abs(from.x - to.x) < EPSILON ? "y" : "x";
  const low = Math.min(from[axis], to[axis]);
  const high = Math.max(from[axis], to[axis]);
  const at = clearCoordinate(layout.nodes.values(), axis, low, high);

  if (at === undefined || extra <= 0) {
    return undefined;
  }

  const move = (point: Point): Point =>
    point[axis] > at + EPSILON
      ? { ...point, [axis]: point[axis] + extra }
      : point;

  return {
    nodes: new Map(
      [...layout.nodes].map(([id, rect]) => {
        const [start, end] = span(rect, axis);

        return (start + end) / 2 > at
          ? [id, { ...rect, [axis]: rect[axis] + extra }]
          : [id, rect];
      }),
    ),
    edges: new Map(
      [...layout.edges].map(([id, points]) => [id, points.map(move)]),
    ),
    size:
      axis === "x"
        ? { ...layout.size, width: layout.size.width + extra }
        : { ...layout.size, height: layout.size.height + extra },
  };
}
