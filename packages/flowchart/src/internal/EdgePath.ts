import { type Point, roundTo } from "@rhumb/kernel";

import type { Hop } from "./EdgeCrossings";

function format(point: Point): string {
  return `${String(roundTo(point.x))},${String(roundTo(point.y))}`;
}

/** SVG path data of a polyline whose horizontal runs arch over crossings. */
export function buildEdgePath(
  points: readonly Point[],
  hops: readonly Hop[],
  radius: number,
): string {
  const [first, ...rest] = points;

  if (first === undefined) {
    return "";
  }

  const commands = [`M${format(first)}`];
  let previous = first;

  rest.forEach((target, index) => {
    const direction = Math.sign(target.x - previous.x);
    const ordered = hops
      .filter((hop) => hop.segment === index)
      .sort((p, q) => direction * (p.at.x - q.at.x));

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

    commands.push(`L${format(target)}`);
    previous = target;
  });

  return commands.join(" ");
}
