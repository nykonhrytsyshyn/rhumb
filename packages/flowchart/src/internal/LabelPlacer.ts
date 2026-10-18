import type { EdgeId, NodeId, Point, Rect, Size } from "@rhumb/kernel";

import type { Stretch } from "./LayoutGaps";

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
  readonly arrowLength: number;
}

interface LabelLine {
  readonly id: EdgeId;
  readonly points: readonly Point[];
  readonly arrow: boolean;
  readonly text: string;
  readonly size: Size;
  /** The line as laid out, before it was stopped at a line it joins. */
  readonly fullPoints?: readonly Point[];
}

/** Cost of one thing a label would sit on. */
const COLLISION = 1000;

/**
 * Cost of using a later stretch of a line rather than its own start; it
 * grows with each stretch, so the closest one to the source wins.
 */
const FALLBACK = 20;

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

function overlapArea(a: Rect, b: Rect): number {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);

  return width > 0 && height > 0 ? width * height : 0;
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
      const tail = line.arrow && segment === last ? this.spacing.stub * 2 : 0;
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
   * covers least. When the line is too short for that, such as one that
   * stops at a line it joins, the label goes beside the stretch the two
   * share instead.
   */
  public placeBeside(
    line: LabelLine,
    surroundings: LabelSurroundings,
  ): PlacedLabel | undefined {
    const { points } = line;
    const own = this.besideSegment(line, surroundings, points, 0, 0);

    if (own !== undefined && own.cost < COLLISION) {
      return own.label;
    }

    const full = line.fullPoints ?? points;
    let best = own;

    for (let index = 1; index + 1 < full.length; index += 1) {
      const found = this.besideSegment(
        line,
        surroundings,
        full,
        index,
        FALLBACK + index * 2,
      );

      if (
        found !== undefined &&
        (best === undefined || found.cost < best.cost)
      ) {
        best = found;
      }
    }

    return best?.label;
  }

  private besideSegment(
    line: LabelLine,
    surroundings: LabelSurroundings,
    path: readonly Point[],
    index: number,
    penalty: number,
  ): { label: PlacedLabel; cost: number } | undefined {
    const { size } = line;
    const start = path[index];
    const next = path[index + 1];
    const after = path[index + 2];

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

    // From just past the source towards the far end of the segment: a short
    // segment gets its middle.
    const nearest = Math.min(along, length / 2);
    const farthest = Math.max(length - along, length / 2);
    const distances = new Set<number>([nearest, length / 2, farthest]);

    // Also closer to the source, where a short segment leaves the most room.
    for (
      let at = index === 0 ? 0 : nearest;
      at < farthest;
      at += Math.max(2, along / 4)
    ) {
      distances.add(at);
    }

    // The side away from the turn first, then the other.
    [1, -1].forEach((side, rank) => {
      for (const distance of distances) {
        const label: PlacedLabel = {
          text: line.text,
          cx: start.x + ux * distance + nx * offset * side,
          cy: start.y + uy * distance + ny * offset * side,
          size,
          inline: false,
        };
        const cost =
          this.collisions(label, line.id, surroundings) * COLLISION +
          penalty +
          rank * 2 +
          Math.abs(distance - nearest) / length;

        if (best === undefined || cost < best.cost) {
          best = { label, cost };
        }
      }
    });

    return best;
  }

  /** True when the label still sits on something. */
  public isCrowded(
    label: PlacedLabel,
    line: LabelLine,
    surroundings: LabelSurroundings,
  ): boolean {
    return this.collisions(label, line.id, surroundings) > 0;
  }

  /**
   * How much longer a line would have to be for its label to fit, with the
   * stretch that has to grow: the first one for a label beside the line, the
   * longest one for a label on it. Nothing when length is not what is short.
   */
  public stretchFor(line: LabelLine, inline: boolean): Stretch | undefined {
    const { points, size } = line;
    const segments = points.slice(1).flatMap((to, index) => {
      const from = points[index];

      return from === undefined
        ? []
        : [{ from, to, length: Math.hypot(to.x - from.x, to.y - from.y) }];
    });
    const segment = inline
      ? [...segments].sort((a, b) => b.length - a.length)[0]
      : segments[0];

    if (segment === undefined || segment.length === 0) {
      return undefined;
    }

    const ux = Math.abs(segment.to.x - segment.from.x) / segment.length;
    const uy = Math.abs(segment.to.y - segment.from.y) / segment.length;
    const extent = ux * size.width + uy * size.height;
    const { padding, stub, arrowLength } = this.spacing;
    const needed = inline
      ? extent + padding * 2 + stub * 2
      : extent + padding * 2 + (line.arrow ? arrowLength : 0);
    const extra = Math.ceil(needed - segment.length);

    return extra > 0
      ? { from: segment.from, to: segment.to, extra }
      : undefined;
  }

  /** How many things the label would sit on. */
  private collisions(
    label: PlacedLabel,
    own: EdgeId,
    { nodes, edges, hops, placed }: LabelSurroundings,
  ): number {
    const rect = around(label, label.inline ? 0 : 1);
    // A label sitting right against a line or a junction reads as part of it.
    const roomy = around(
      label,
      label.inline ? this.spacing.padding : this.spacing.padding / 2,
    );
    const archReach = this.spacing.jumpRadius + 1;
    let count = 0;

    // A block is only a bounding box here, and its corners (those of a
    // diamond, say) are empty, so a label may reach a little into it.
    for (const bounds of nodes.values()) {
      if (overlapArea(rect, bounds) > rect.width * rect.height * 0.25) {
        count += 1;
      }
    }

    for (const [id, points] of edges) {
      if (label.inline && id === own) {
        continue;
      }

      count += points.slice(1).filter((to, index) => {
        const from = points[index];

        return from !== undefined && crosses(roomy, from, to);
      }).length;
    }

    // The arrowhead at the end of a line, where it flows into a block or
    // into another line.
    const reach = this.spacing.arrowLength;

    for (const [id, points] of edges) {
      const end = points.at(-1);

      if (
        end !== undefined &&
        !(label.inline && id === own) &&
        overlaps(rect, {
          x: end.x - reach,
          y: end.y - reach,
          width: reach * 2,
          height: reach * 2,
        })
      ) {
        count += 1;
      }
    }

    for (const hop of hops) {
      if (
        overlaps(roomy, {
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
