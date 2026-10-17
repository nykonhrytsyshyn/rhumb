import type { EdgeId, NodeId, Point } from "@rhumb/kernel";

export interface MergeCandidate {
  readonly id: EdgeId;
  readonly to: NodeId;
  /** Whether the line carries an arrowhead at its end. */
  readonly arrow: boolean;
  readonly points: readonly Point[];
}

const EPSILON = 1e-3;

function samePoint(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < EPSILON && Math.abs(a.y - b.y) < EPSILON;
}

function onSegment(point: Point, from: Point, to: Point): boolean {
  return (
    point.x >= Math.min(from.x, to.x) - EPSILON &&
    point.x <= Math.max(from.x, to.x) + EPSILON &&
    point.y >= Math.min(from.y, to.y) - EPSILON &&
    point.y <= Math.max(from.y, to.y) + EPSILON &&
    // Lines are orthogonal, so a point is on one when it shares its axis.
    (Math.abs(from.x - to.x) < EPSILON
      ? Math.abs(point.x - from.x) < EPSILON
      : Math.abs(point.y - from.y) < EPSILON)
  );
}

function onPath(point: Point, path: readonly Point[]): boolean {
  return path.some((from, index) => {
    const to = path[index + 1];

    return to !== undefined && onSegment(point, from, to);
  });
}

function length(path: readonly Point[]): number {
  return path.reduce((sum, from, index) => {
    const to = path[index + 1];

    return to === undefined
      ? sum
      : sum + Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
  }, 0);
}

/**
 * Lines that arrive at the same point of a block share their last stretch.
 * The straightest one (the longest, when equally straight) is kept whole; every other one stops where it first
 * touches it, so that its own arrowhead shows which way it flows into the
 * line it joins. Returns the shortened paths by line.
 */
export function joinMergingLines(
  lines: readonly MergeCandidate[],
  minimumRun: number,
): ReadonlyMap<EdgeId, readonly Point[]> {
  const joined = new Map<EdgeId, readonly Point[]>();
  const groups = new Map<string, MergeCandidate[]>();

  for (const line of lines) {
    const end = line.points.at(-1);

    if (end === undefined || line.points.length < 2) {
      continue;
    }

    const key = `${line.to}:${end.x.toFixed(2)}:${end.y.toFixed(2)}`;

    groups.set(key, [...(groups.get(key) ?? []), line]);
  }

  for (const group of groups.values()) {
    const [main] = [...group].sort(
      (a, b) =>
        a.points.length - b.points.length ||
        length(b.points) - length(a.points),
    );

    if (main === undefined) {
      continue;
    }

    for (const line of group) {
      if (line === main || !line.arrow) {
        continue;
      }

      // The first bend, after the start, that lies on the main line.
      const at = line.points.findIndex(
        (point, index) =>
          index > 0 &&
          index < line.points.length - 1 &&
          onPath(point, main.points),
      );
      const join = line.points[at];
      const before = line.points[at - 1];

      if (
        at < 1 ||
        join === undefined ||
        before === undefined ||
        samePoint(join, main.points.at(-1) ?? join) ||
        Math.abs(join.x - before.x) + Math.abs(join.y - before.y) < minimumRun
      ) {
        continue;
      }

      joined.set(line.id, line.points.slice(0, at + 1));
    }
  }

  return joined;
}
