import type { EdgeId, NodeId, Point, Rect, Size } from "@rhumb/kernel";

export interface PlacedLabel {
  readonly text: string;
  readonly cx: number;
  readonly cy: number;
  readonly size: Size;
  /** True when the label sits on its line and needs a backdrop. */
  readonly inline: boolean;
}

/** What a label has to keep clear of. */
export interface LabelSurroundings {
  readonly nodes: ReadonlyMap<NodeId, Rect>;
  /** Every line of the diagram, as drawn. */
  readonly edges: ReadonlyMap<EdgeId, readonly Point[]>;
  /** Places where a line arches over another one. */
  readonly hops: readonly Point[];
  /** Labels already placed. */
  readonly placed: readonly PlacedLabel[];
}

export interface LabelSpacing {
  readonly padding: number;
  readonly stub: number;
  readonly jumpRadius: number;
}

interface LabelLine {
  readonly id: EdgeId;
  readonly points: readonly Point[];
  readonly arrow: boolean;
  readonly text: string;
  readonly size: Size;
}

/** Cost of one thing a label would sit on. */
const COLLISION = 1000;

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

function crosses(rect: Rect, from: Point, to: Point): boolean {
  return overlaps(rect, {
    x: Math.min(from.x, to.x),
    y: Math.min(from.y, to.y),
    width: Math.abs(to.x - from.x),
    height: Math.abs(to.y - from.y),
  });
}

function around(label: PlacedLabel, margin = 0): Rect {
  return {
    x: label.cx - label.size.width / 2 - margin,
    y: label.cy - label.size.height / 2 - margin,
    width: label.size.width + margin * 2,
    height: label.size.height + margin * 2,
  };
}

/**
 * Finds a spot for the text of a line where it covers nothing: no block, no
 * other line, no arch where lines cross and no other label.
 */
export class LabelPlacer {
  public constructor(private readonly spacing: LabelSpacing) {}

  public placeInline(
    line: LabelLine,
    surroundings: LabelSurroundings,
  ): PlacedLabel | undefined {
    const { points, size } = line;
    const segments = points.slice(1).flatMap((to, index) => {
      const from = points[index];

      return from === undefined
        ? []
        : [{ from, to, length: Math.hypot(to.x - from.x, to.y - from.y) }];
    });
    const longest = Math.max(0, ...segments.map(({ length }) => length));
    const last = segments.at(-1);
    let best: { label: PlacedLabel; cost: number } | undefined;

    for (const segment of segments) {
      if (segment.length === 0) {
        continue;
      }

      const ux = (segment.to.x - segment.from.x) / segment.length;
      const uy = (segment.to.y - segment.from.y) / segment.length;
      const half =
        Math.abs(ux) * (size.width / 2) +
        Math.abs(uy) * (size.height / 2) +
        this.spacing.padding / 2;
      // Keep clear of the arrowhead at the end of the line.
      const tail = line.arrow && segment === last ? this.spacing.stub : 0;
      const middle = segment.length / 2;
      const low = half;
      const high = segment.length - half - tail;
      const step = Math.max(2, half / 2);
      const offsets = new Set<number>([
        Math.min(Math.max(middle, low), Math.max(low, high)),
      ]);

      for (let delta = step; delta <= segment.length; delta += step) {
        for (const distance of [middle - delta, middle + delta]) {
          if (distance >= low && distance <= high) {
            offsets.add(distance);
          }
        }
      }

      for (const distance of offsets) {
        const label: PlacedLabel = {
          text: line.text,
          cx: segment.from.x + ux * distance,
          cy: segment.from.y + uy * distance,
          size,
          inline: true,
        };
        const cost =
          this.collisions(label, line.id, surroundings) * COLLISION +
          Math.abs(distance - middle) +
          (longest - segment.length) +
          (high < low ? COLLISION / 2 : 0);

        if (best === undefined || cost < best.cost) {
          best = { label, cost };
        }
      }
    }

    return best?.label;
  }

  /**
   * Puts a label beside a line, close to its source, on the side where it
   * covers least. It starts on the side away from where the line turns.
   */
  public placeBeside(
    line: LabelLine,
    surroundings: LabelSurroundings,
  ): PlacedLabel | undefined {
    const { points, size } = line;
    const [start, next, after] = points;

    if (start === undefined || next === undefined) {
      return undefined;
    }

    const length = Math.hypot(next.x - start.x, next.y - start.y);

    if (length === 0) {
      return undefined;
    }

    const ux = (next.x - start.x) / length;
    const uy = (next.y - start.y) / length;
    let nx = uy;
    let ny = -ux;

    if (
      after !== undefined &&
      nx * (after.x - next.x) + ny * (after.y - next.y) > 0
    ) {
      nx = -nx;
      ny = -ny;
    }

    const gap = this.spacing.padding;
    const along =
      Math.abs(ux) * (size.width / 2) + Math.abs(uy) * (size.height / 2) + gap;
    const offset =
      Math.abs(nx) * (size.width / 2) + Math.abs(ny) * (size.height / 2) + gap;
    let best: { label: PlacedLabel; cost: number } | undefined;

    // Preferred side first, then the other; nearest to the source first.
    [
      [1, 0],
      [-1, 0],
      [1, 1],
      [-1, 1],
    ].forEach(([side = 1, farther = 0], rank) => {
      const distance = along + farther * (along + gap);

      if (farther > 0 && distance + along > length) {
        return;
      }

      const label: PlacedLabel = {
        text: line.text,
        cx: start.x + ux * distance + nx * offset * side,
        cy: start.y + uy * distance + ny * offset * side,
        size,
        inline: false,
      };
      const cost =
        this.collisions(label, line.id, surroundings) * COLLISION + rank;

      if (best === undefined || cost < best.cost) {
        best = { label, cost };
      }
    });

    return best?.label;
  }

  /** How many things the label would sit on. */
  private collisions(
    label: PlacedLabel,
    own: EdgeId,
    { nodes, edges, hops, placed }: LabelSurroundings,
  ): number {
    const rect = around(label, label.inline ? 0 : 1);
    const archReach = this.spacing.jumpRadius + 1;
    let count = 0;

    for (const bounds of nodes.values()) {
      if (overlaps(rect, bounds)) {
        count += 1;
      }
    }

    for (const [id, points] of edges) {
      if (label.inline && id === own) {
        continue;
      }

      count += points.slice(1).filter((to, index) => {
        const from = points[index];

        return from !== undefined && crosses(rect, from, to);
      }).length;
    }

    for (const hop of hops) {
      if (
        overlaps(rect, {
          x: hop.x - archReach,
          y: hop.y - archReach,
          width: archReach * 2,
          height: archReach * 2,
        })
      ) {
        count += 1;
      }
    }

    for (const other of placed) {
      if (overlaps(rect, around(other))) {
        count += 1;
      }
    }

    return count;
  }
}
