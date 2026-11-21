import { type Point, roundTo } from "@rhumb/kernel";

import type { Hop } from "./EdgeCrossings";

/** A stretch of a line left open for a symbol that sits on it. */
export interface EdgeGap {
  /** Centre of the symbol. */
  readonly x: number;
  readonly y: number;
  /** Half of the length cut out of the line, along the line. */
  readonly reach: number;
}

/** One straight piece of a line, remembering the segment it came from. */
interface Span {
  readonly from: Point;
  readonly to: Point;
  readonly segment: number;
  /** True when only a part of the original segment is left. */
  readonly trimmed: boolean;
}

function format(point: Point): string {
  return `${String(roundTo(point.x))},${String(roundTo(point.y))}`;
}

/** Part of a line, measured from its start, that a gap removes. */
interface Interval {
  readonly start: number;
  readonly end: number;
}

/** Distances from the start of the line to each of its corners. */
function offsetsOf(points: readonly Point[]): readonly number[] {
  const offsets = [0];

  points.slice(1).forEach((to, index) => {
    const from = points[index] ?? to;

    offsets.push(
      (offsets[index] ?? 0) + Math.hypot(to.x - from.x, to.y - from.y),
    );
  });

  return offsets;
}

/** The stretch of line a gap removes, found by where its centre lies. */
function locate(
  points: readonly Point[],
  offsets: readonly number[],
  gap: EdgeGap,
): Interval | undefined {
  let best: { centre: number; distance: number } | undefined;

  points.slice(1).forEach((to, index) => {
    const from = points[index];

    if (from === undefined) {
      return;
    }

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);

    if (length === 0) {
      return;
    }

    const along = ((gap.x - from.x) * dx + (gap.y - from.y) * dy) / length;
    const reached = Math.min(length, Math.max(0, along));
    const distance = Math.hypot(
      gap.x - (from.x + (dx / length) * reached),
      gap.y - (from.y + (dy / length) * reached),
    );

    if (best === undefined || distance < best.distance) {
      best = { distance, centre: (offsets[index] ?? 0) + reached };
    }
  });

  return best === undefined
    ? undefined
    : { start: best.centre - gap.reach, end: best.centre + gap.reach };
}

function lerp(from: Point, to: Point, distance: number): Point {
  const length = Math.hypot(to.x - from.x, to.y - from.y);

  return length === 0
    ? from
    : {
        x: from.x + ((to.x - from.x) / length) * distance,
        y: from.y + ((to.y - from.y) / length) * distance,
      };
}

/** Joins intervals that overlap, in the order they lie along the line. */
function merged(intervals: readonly Interval[]): readonly Interval[] {
  const result: Interval[] = [];

  for (const next of [...intervals].sort((p, q) => p.start - q.start)) {
    const last = result[result.length - 1];

    if (last !== undefined && next.start <= last.end) {
      result[result.length - 1] = {
        start: last.start,
        end: Math.max(last.end, next.end),
      };
    } else {
      result.push(next);
    }
  }

  return result;
}

/** Splits a polyline into the pieces that remain once the gaps are cut. */
function piecesOf(
  points: readonly Point[],
  gaps: readonly EdgeGap[],
): readonly (readonly Span[])[] {
  const offsets = offsetsOf(points);
  const cuts = merged(
    gaps.flatMap((gap) => {
      const cut = locate(points, offsets, gap);

      return cut === undefined ? [] : [cut];
    }),
  );
  const pieces: Span[][] = [[]];
  let reached = 0;

  points.slice(1).forEach((to, index) => {
    const from = points[index];
    const first = offsets[index] ?? 0;
    const last = offsets[index + 1] ?? first;

    if (from === undefined || last <= first) {
      return;
    }

    // What is left of this segment once the gaps are taken out of it.
    const kept: Interval[] = [];
    let cursor = first;

    for (const cut of cuts) {
      if (cut.end <= cursor || cut.start >= last) {
        continue;
      }

      if (cut.start > cursor) {
        kept.push({ start: cursor, end: cut.start });
      }

      cursor = Math.max(cursor, cut.end);
    }

    if (cursor < last) {
      kept.push({ start: cursor, end: last });
    }

    for (const part of kept) {
      if (part.end - part.start < 1e-9) {
        continue;
      }

      if (part.start - reached > 1e-9) {
        pieces.push([]);
      }

      pieces[pieces.length - 1]?.push({
        from: lerp(from, to, part.start - first),
        to: lerp(from, to, part.end - first),
        segment: index,
        trimmed: part.start > first || part.end < last,
      });
      reached = part.end;
    }
  });

  return pieces.filter((piece) => piece.length > 0);
}

function hopsOn(span: Span, hops: readonly Hop[], radius: number): Hop[] {
  const low = Math.min(span.from.x, span.to.x);
  const high = Math.max(span.from.x, span.to.x);

  return hops.filter(
    (hop) =>
      hop.segment === span.segment &&
      (!span.trimmed ||
        (hop.at.x - radius >= low && hop.at.x + radius <= high)),
  );
}

export function buildEdgePath(
  points: readonly Point[],
  hops: readonly Hop[],
  radius: number,
  gaps: readonly EdgeGap[] = [],
): string {
  const [first] = points;

  if (first === undefined) {
    return "";
  }

  if (points.length < 2) {
    return `M${format(first)}`;
  }

  const commands: string[] = [];

  for (const piece of piecesOf(points, gaps)) {
    const [head] = piece;

    if (head === undefined) {
      continue;
    }

    commands.push(`M${format(head.from)}`);

    for (const span of piece) {
      const direction = Math.sign(span.to.x - span.from.x);
      const ordered = hopsOn(span, hops, radius).sort(
        (p, q) => direction * (p.at.x - q.at.x),
      );

      for (const hop of ordered) {
        const before = { x: hop.at.x - direction * radius, y: hop.at.y };
        const after = { x: hop.at.x + direction * radius, y: hop.at.y };
        const sweep = direction > 0 ? 1 : 0;
        const r = String(roundTo(radius));

        commands.push(
          `L${format(before)}`,
          `A${r},${r} 0 0 ${String(sweep)} ${format(after)}`,
        );
      }

      commands.push(`L${format(span.to)}`);
    }
  }

  return commands.join(" ");
}
