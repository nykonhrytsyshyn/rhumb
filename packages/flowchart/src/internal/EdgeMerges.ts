import type { EdgeId, NodeId, Point } from "@rhumb/kernel";

export interface MergeCandidate {
  readonly id: EdgeId;
  readonly to: NodeId;
  /** Whether the line carries an arrowhead at its end. */
  readonly arrow: boolean;
  readonly points: readonly Point[];
}

const EPSILON = 1e-3;

type Path = readonly Point[];

function same(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < EPSILON && Math.abs(a.y - b.y) < EPSILON;
}

function vertical(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < EPSILON;
}

function within(value: number, a: number, b: number): boolean {
  return value >= Math.min(a, b) - EPSILON && value <= Math.max(a, b) + EPSILON;
}

function onSegment(point: Point, a: Point, b: Point): boolean {
  return vertical(a, b)
    ? Math.abs(point.x - a.x) < EPSILON && within(point.y, a.y, b.y)
    : Math.abs(point.y - a.y) < EPSILON && within(point.x, a.x, b.x);
}

function onPath(point: Point, path: Path): boolean {
  return path.some((a, index) => {
    const b = path[index + 1];

    return b !== undefined && onSegment(point, a, b);
  });
}

function distance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function length(path: Path): number {
  return path.reduce((sum, a, index) => {
    const b = path[index + 1];

    return b === undefined ? sum : sum + distance(a, b);
  }, 0);
}

/** Overlap of two ranges on one axis, as the length they share. */
function overlap(a1: number, a2: number, b1: number, b2: number): number {
  return (
    Math.min(Math.max(a1, a2), Math.max(b1, b2)) -
    Math.max(Math.min(a1, a2), Math.min(b1, b2))
  );
}

/** Drops repeated points and the middle points of straight runs. */
function tidy(path: Path): Point[] {
  const result: Point[] = [];

  for (const point of path) {
    const last = result.at(-1);

    if (last !== undefined && same(last, point)) {
      continue;
    }

    const before = result.at(-2);

    if (
      last !== undefined &&
      before !== undefined &&
      ((vertical(before, last) && vertical(last, point)) ||
        (Math.abs(before.y - last.y) < EPSILON &&
          Math.abs(last.y - point.y) < EPSILON))
    ) {
      result.pop();
    }

    result.push(point);
  }

  return result;
}

/**
 * Lines that run side by side a hair apart, only to meet a moment later,
 * leave a small jog behind. A run of the line that sits within `reach` of a
 * parallel run of the reference line is moved onto it.
 */
function straighten(path: Path, reference: Path, reach: number): Path {
  const points = path.map((point) => ({ ...point }));

  for (let index = 1; index + 2 < points.length; index += 1) {
    const a = points[index];
    const b = points[index + 1];

    if (a === undefined || b === undefined) {
      continue;
    }

    for (let at = 0; at + 1 < reference.length; at += 1) {
      const c = reference[at];
      const d = reference[at + 1];

      if (c === undefined || d === undefined || same(c, d)) {
        continue;
      }

      if (vertical(a, b) && vertical(c, d)) {
        const gap = Math.abs(a.x - c.x);

        if (gap > EPSILON && gap <= reach && overlap(a.y, b.y, c.y, d.y) > 0) {
          a.x = c.x;
          b.x = c.x;
          break;
        }
      } else if (!vertical(a, b) && !vertical(c, d)) {
        const gap = Math.abs(a.y - c.y);

        if (gap > EPSILON && gap <= reach && overlap(a.x, b.x, c.x, d.x) > 0) {
          a.y = c.y;
          b.y = c.y;
          break;
        }
      }
    }
  }

  return tidy(points);
}

/** Where the segment a-b first touches the segment c-d, walking from a. */
function touch(a: Point, b: Point, c: Point, d: Point): Point | undefined {
  if (vertical(a, b) !== vertical(c, d)) {
    const q = vertical(a, b) ? { x: a.x, y: c.y } : { x: c.x, y: a.y };

    return onSegment(q, a, b) && onSegment(q, c, d) ? q : undefined;
  }

  if (vertical(a, b)) {
    if (Math.abs(a.x - c.x) > EPSILON) {
      return undefined;
    }

    const low = Math.max(Math.min(a.y, b.y), Math.min(c.y, d.y));
    const high = Math.min(Math.max(a.y, b.y), Math.max(c.y, d.y));

    return low > high + EPSILON
      ? undefined
      : { x: a.x, y: a.y <= b.y ? low : high };
  }

  if (Math.abs(a.y - c.y) > EPSILON) {
    return undefined;
  }

  const low = Math.max(Math.min(a.x, b.x), Math.min(c.x, d.x));
  const high = Math.min(Math.max(a.x, b.x), Math.max(c.x, d.x));

  return low > high + EPSILON
    ? undefined
    : { x: a.x <= b.x ? low : high, y: a.y };
}

/**
 * Where a line first runs into the main one and carries on along it, as the
 * path up to that point. A line that merely crosses does not count.
 */
function cutAtContact(path: Path, main: Path): Point[] | undefined {
  for (let index = 0; index + 1 < path.length; index += 1) {
    const a = path[index];
    const b = path[index + 1];

    if (a === undefined || b === undefined || same(a, b)) {
      continue;
    }

    const found = main
      .flatMap((c, at) => {
        const d = main[at + 1];
        const q = d === undefined || same(c, d) ? undefined : touch(a, b, c, d);

        return q === undefined ? [] : [q];
      })
      .filter((q) => index > 0 || distance(a, q) > EPSILON)
      .sort((p, q) => distance(a, p) - distance(a, q));

    for (const q of found) {
      // The direction the line takes from here.
      const target = same(q, b) ? path[index + 2] : b;

      if (target === undefined || same(q, target)) {
        continue;
      }

      const step = {
        x: q.x + Math.sign(target.x - q.x),
        y: q.y + Math.sign(target.y - q.y),
      };

      if (onPath(step, main)) {
        return tidy([...path.slice(0, index + 1), q]);
      }
    }
  }

  return undefined;
}

/**
 * Lines that arrive at the same point of a block share their last stretch.
 * One of them runs on whole; every other one stops where it meets it, so
 * that its own arrowhead shows which way it flows into the line it joins.
 * The whole one is the line that lets the others be cut shortest, and when
 * that is a tie the straighter and then the longer one.
 *
 * Lines that run a hair apart (within `reach`) are first brought onto the
 * same track. Returns the paths that changed, by line.
 */
export function joinMergingLines(
  lines: readonly MergeCandidate[],
  minimumRun: number,
  reach = 0,
): ReadonlyMap<EdgeId, readonly Point[]> {
  const result = new Map<EdgeId, Path>();
  const groups = new Map<string, MergeCandidate[]>();

  for (const line of lines) {
    const end = line.points.at(-1);

    if (end !== undefined && line.points.length >= 2) {
      const key = `${line.to}:${end.x.toFixed(2)}:${end.y.toFixed(2)}`;

      groups.set(key, [...(groups.get(key) ?? []), line]);
    }
  }

  for (const group of groups.values()) {
    if (group.length < 2) {
      continue;
    }

    const [reference] = [...group].sort(
      (a, b) =>
        a.points.length - b.points.length ||
        length(b.points) - length(a.points),
    );
    const paths = new Map<EdgeId, Path>(
      group.map((line) => [
        line.id,
        line.arrow && line !== reference && reference !== undefined
          ? straighten(line.points, reference.points, reach)
          : line.points,
      ]),
    );

    const cut = (line: MergeCandidate, main: MergeCandidate) => {
      const path = paths.get(line.id) ?? line.points;
      const mainPath = paths.get(main.id) ?? main.points;
      const cutPath = line.arrow ? cutAtContact(path, mainPath) : undefined;
      const last = cutPath?.at(-1);
      const before = cutPath?.at(-2);

      return cutPath === undefined ||
        last === undefined ||
        before === undefined ||
        distance(before, last) < minimumRun
        ? undefined
        : cutPath;
    };

    const ranked = group
      .map((main) => ({
        main,
        removed: Math.round(
          group.reduce((sum, line) => {
            const cutPath = line === main ? undefined : cut(line, main);

            return cutPath === undefined
              ? sum
              : sum +
                  length(paths.get(line.id) ?? line.points) -
                  length(cutPath);
          }, 0),
        ),
      }))
      .sort(
        (a, b) =>
          b.removed - a.removed ||
          (paths.get(a.main.id)?.length ?? 0) -
            (paths.get(b.main.id)?.length ?? 0) ||
          length(b.main.points) - length(a.main.points),
      );
    const main = ranked[0]?.main;

    for (const line of group) {
      const cutPath =
        main === undefined || line === main ? undefined : cut(line, main);
      const path = cutPath ?? paths.get(line.id) ?? line.points;

      if (
        path !== line.points &&
        (cutPath !== undefined ||
          path.length !== line.points.length ||
          path.some((p, i) => !same(p, line.points[i] ?? p)))
      ) {
        result.set(line.id, path);
      }
    }
  }

  return result;
}
