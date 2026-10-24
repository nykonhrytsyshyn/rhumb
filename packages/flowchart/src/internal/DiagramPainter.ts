import {
  type DiagramEdge,
  type DiagramNode,
  type EdgeId,
  type FlowchartDiagram,
  type LayoutResult,
  type NodeId,
  type Point,
  type Rect,
  type Shape,
  Side,
  type SvgNode,
  type TextMeasurer,
  roundTo,
  svgNode,
} from "@rhumb/kernel";

import type { Appearance, RenderedDiagram } from "../api/render/types";
import { CrossingFinder, type Hop, type RoutedEdge } from "./EdgeCrossings";
import { joinMergingLines } from "./EdgeMerges";
import { buildEdgePath } from "./EdgePath";
import { LabelPlacer, type PlacedLabel } from "./LabelPlacer";
import { type Stretch, openGap } from "./LayoutGaps";
import type { Metrics } from "./Metrics";
import { NodeFrame } from "./NodeFrame";
import { triangleCorners } from "./shapes/TransferShape";

const ARROW_ID = "rhumb-arrow";

/** A line label whose position has been decided. */
interface Extent {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

/** How many times a diagram may be stretched to make room for labels. */
const MAX_ROOM_PASSES = 8;

/** A piece of text that sits outside the blocks: titles, identifiers. */
interface Caption {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly anchor: "start" | "end";
  readonly width: number;
  readonly height: number;
}

/** Block outlines that are plain rectangles need no clipping for a stripe. */
const RECTANGULAR = new Set<DiagramNode["kind"]>([
  "process",
  "predefinedProcess",
  "internalStorage",
]);

/** Turns a computed layout into the final SVG tree. */
export class DiagramPainter {
  private readonly frame: NodeFrame;

  public constructor(
    private readonly metrics: Metrics,
    private readonly measurer: TextMeasurer,
    private readonly appearance: Appearance,
  ) {
    this.frame = new NodeFrame(metrics);
  }

  public paint(
    diagram: FlowchartDiagram,
    shapes: ReadonlyMap<NodeId, Shape>,
    routed: LayoutResult,
  ): RenderedDiagram {
    const { margin } = this.metrics;
    let current = routed;
    let layout = this.withJoinedMerges(diagram, current);
    let hops = this.findHops(diagram, layout);
    let placed = this.edgeLabels(diagram, layout, hops, current);

    // A label that finds no room makes its line longer, and the diagram
    // grows with it.
    for (let pass = 0; pass < MAX_ROOM_PASSES; pass += 1) {
      const opened = placed.cramped
        .map((stretch) => openGap(current, stretch))
        .find((result) => result !== undefined);

      if (opened === undefined) {
        break;
      }

      current = opened;
      layout = this.withJoinedMerges(diagram, current);
      hops = this.findHops(diagram, layout);
      placed = this.edgeLabels(diagram, layout, hops, current);
    }

    const labels = placed.labels;
    const captions = this.captions(diagram, layout);
    const body = this.extentOf(layout, labels, captions);
    const legend = this.legend(diagram, body);
    const extent = { ...body, maxX: legend.maxX, maxY: legend.maxY };
    const width = roundTo(extent.maxX - extent.minX + margin * 2);
    const height = roundTo(extent.maxY - extent.minY + margin * 2);
    const shiftX = roundTo(margin - extent.minX);
    const shiftY = roundTo(margin - extent.minY);

    const content = svgNode(
      "g",
      { transform: `translate(${String(shiftX)} ${String(shiftY)})` },
      [
        ...this.frameLayer(diagram, layout),
        ...this.stackLayer(diagram, shapes, layout),
        this.edgeLayer(diagram, layout, hops),
        ...this.markLayer(layout, labels),
        this.nodeLayer(diagram, shapes, layout),
        ...this.labelBackdropLayer(labels),
        this.textLayer(diagram, shapes, layout, labels, captions),
        ...legend.nodes,
      ],
    );
    const { background } = this.appearance;
    const page =
      background === null
        ? []
        : [svgNode("rect", { width, height, fill: background })];

    const svg = svgNode(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width,
        height,
        viewBox: `0 0 ${String(width)} ${String(height)}`,
      },
      [...page, this.definitions(), content],
    );
    return { svg, size: { width, height } };
  }

  private definitions(): SvgNode {
    const { arrowLength: length, arrowWidth: width } = this.metrics;
    const tip = `M0,0 L${String(length)},${String(width / 2)} L0,${String(width)}`;
    const filled = this.metrics.arrowStyle === "filled";
    const arrow = svgNode("path", {
      d: filled ? `${tip} Z` : tip,
      fill: filled ? this.appearance.ink : "none",
      stroke: filled ? "none" : this.appearance.ink,
      "stroke-width": this.metrics.lineWidth,
      "stroke-linejoin": "round",
    });
    return svgNode("defs", {}, [
      svgNode(
        "marker",
        {
          id: ARROW_ID,
          markerUnits: "userSpaceOnUse",
          markerWidth: length,
          markerHeight: width,
          refX: length,
          refY: roundTo(width / 2),
          orient: "auto",
          overflow: "visible",
        },
        [arrow],
      ),
    ]);
  }

  /** Stops lines that merge into another one where they meet it. */
  private withJoinedMerges(
    diagram: FlowchartDiagram,
    layout: LayoutResult,
  ): LayoutResult {
    if (!this.metrics.mergeArrows) {
      return layout;
    }

    const lines = diagram.edges.flatMap((edge) => {
      const points = layout.edges.get(edge.id);

      return points === undefined
        ? []
        : [{ id: edge.id, to: edge.to, arrow: edge.arrow, points }];
    });
    const joined = joinMergingLines(
      lines,
      this.metrics.arrowLength * 1.5,
      this.metrics.lineSpacing * 4,
    );

    return { ...layout, edges: new Map([...layout.edges, ...joined]) };
  }

  private findHops(
    diagram: FlowchartDiagram,
    layout: LayoutResult,
  ): ReadonlyMap<EdgeId, readonly Hop[]> {
    const routed: RoutedEdge[] = [];

    for (const edge of diagram.edges) {
      const points = layout.edges.get(edge.id);

      if (points === undefined || points.length < 2) {
        continue;
      }

      routed.push({ id: edge.id, from: edge.from, to: edge.to, points });
    }

    return new CrossingFinder(this.metrics.jumpRadius).find(routed);
  }

  private edgeLayer(
    diagram: FlowchartDiagram,
    layout: LayoutResult,
    hops: ReadonlyMap<EdgeId, readonly Hop[]>,
  ): SvgNode {
    const lines = diagram.edges.flatMap((edge) => {
      const points = layout.edges.get(edge.id);

      if (points === undefined || points.length < 2) {
        return [];
      }

      return [this.edgeLine(edge, points, hops.get(edge.id) ?? [])];
    });

    return svgNode(
      "g",
      { fill: "none", stroke: this.appearance.ink, "stroke-linejoin": "round" },
      lines,
    );
  }

  private edgeLine(
    edge: DiagramEdge,
    points: readonly Point[],
    hops: readonly Hop[],
  ): SvgNode {
    const attrs: Record<string, string | number> = {
      "data-edge": edge.id,
      d: buildEdgePath(points, hops, this.metrics.jumpRadius),
      "stroke-width":
        edge.line === "thick"
          ? this.metrics.thickWidth
          : this.metrics.lineWidth,
    };

    if (edge.line === "dashed") {
      attrs["stroke-dasharray"] = this.metrics.dash.join(" ");
    }

    if (edge.arrow) {
      attrs["marker-end"] = `url(#${ARROW_ID})`;
    }

    return svgNode("path", attrs);
  }

  private nodeLayer(
    diagram: FlowchartDiagram,
    shapes: ReadonlyMap<NodeId, Shape>,
    layout: LayoutResult,
  ): SvgNode {
    const drawn: SvgNode[] = [];

    diagram.nodes.forEach((node, index) => {
      const shape = shapes.get(node.id);
      const bounds = layout.nodes.get(node.id);

      if (shape === undefined || bounds === undefined) {
        return;
      }

      const front = this.frame.front(node, bounds);
      const outline = shape.draw(front);

      drawn.push(outline, ...this.stripe(node, index, outline, front));
    });

    return svgNode(
      "g",
      {
        fill: this.appearance.fill,
        stroke: this.appearance.ink,
        "stroke-width": this.metrics.lineWidth,
        "stroke-linejoin": "round",
      },
      drawn,
    );
  }

  /** The line under the reference of a block, kept inside its outline. */
  private stripe(
    node: DiagramNode,
    index: number,
    outline: SvgNode,
    front: Rect,
  ): readonly SvgNode[] {
    const band = this.frame.band(node);

    if (band === 0) {
      return [];
    }

    const y = roundTo(front.y + band);
    const rule = svgNode("line", {
      x1: roundTo(front.x),
      y1: y,
      x2: roundTo(front.x + front.width),
      y2: y,
    });

    if (RECTANGULAR.has(node.kind)) {
      return [rule];
    }

    const id = `rhumb-stripe-${String(index)}`;
    const parts = outline.tag === "g" ? outline.children : [outline];
    const clip = svgNode(
      "clipPath",
      { id },
      parts.filter((part): part is SvgNode => typeof part !== "string"),
    );

    return [clip, svgNode("g", { "clip-path": `url(#${id})` }, [rule])];
  }

  /** The copies behind blocks that stand for several of the same. */
  private stackLayer(
    diagram: FlowchartDiagram,
    shapes: ReadonlyMap<NodeId, Shape>,
    layout: LayoutResult,
  ): readonly SvgNode[] {
    const behind: SvgNode[] = [];

    for (const node of diagram.nodes) {
      const shape = shapes.get(node.id);
      const bounds = layout.nodes.get(node.id);
      const copies = this.frame.copies(node);

      if (shape === undefined || bounds === undefined || copies < 2) {
        continue;
      }

      const front = this.frame.front(node, bounds);

      for (let copy = copies - 1; copy >= 1; copy -= 1) {
        const offset = copy * this.frame.shift();

        behind.push(
          shape.draw({ ...front, x: front.x - offset, y: front.y - offset }),
        );
      }
    }

    return behind.length === 0
      ? []
      : [
          svgNode(
            "g",
            {
              fill: this.appearance.fill,
              stroke: this.appearance.ink,
              "stroke-width": this.metrics.lineWidth,
              "stroke-linejoin": "round",
            },
            behind,
          ),
        ];
  }

  /** Dashed frames, the outermost first so that inner ones lie on top. */
  private frameLayer(
    diagram: FlowchartDiagram,
    layout: LayoutResult,
  ): readonly SvgNode[] {
    const frames = diagram.groups.flatMap((group) => {
      const bounds = layout.groups?.get(group.id);

      return bounds === undefined
        ? []
        : [
            svgNode("rect", {
              "data-frame": group.id,
              x: roundTo(bounds.x),
              y: roundTo(bounds.y),
              width: roundTo(bounds.width),
              height: roundTo(bounds.height),
            }),
          ];
    });

    return frames.length === 0
      ? []
      : [
          svgNode(
            "g",
            {
              fill: "none",
              stroke: this.appearance.ink,
              "stroke-width": this.metrics.lineWidth,
              "stroke-dasharray": this.metrics.dash.join(" "),
            },
            frames,
          ),
        ];
  }

  /**
   * The symbols that sit on a line: three dots for what is left out, and a
   * zigzag for a communication link. Each stands where the placer kept room
   * for it and cuts the line open exactly as wide as the symbol, so that the
   * line meets its ends.
   */
  private markLayer(
    layout: LayoutResult,
    labels: readonly PlacedLabel[],
  ): readonly SvgNode[] {
    const marks: SvgNode[] = [];
    const { lineWidth, markLength } = this.metrics;
    const reach = markLength / 2;
    const radius = lineWidth * 0.9;

    for (const label of labels) {
      const mark = label.mark;
      const points =
        mark === undefined ? undefined : layout.edges.get(mark.edge);

      if (mark === undefined || points === undefined) {
        continue;
      }

      const along = DiagramPainter.directionAt(points, label.cx, label.cy);
      const { cx, cy } = label;
      const at = (u: number, v: number): Point =>
        along === "x" ? { x: cx + u, y: cy + v } : { x: cx + v, y: cy + u };
      const across =
        mark.kind === "channel" ? reach / 2 + lineWidth * 2 : lineWidth * 2;
      const corner = at(-reach, -across);
      const far = at(reach, across);

      marks.push(
        svgNode("rect", {
          fill: this.appearance.labelBackground,
          stroke: "none",
          x: roundTo(Math.min(corner.x, far.x)),
          y: roundTo(Math.min(corner.y, far.y)),
          width: roundTo(Math.abs(far.x - corner.x)),
          height: roundTo(Math.abs(far.y - corner.y)),
        }),
      );

      if (mark.kind === "channel") {
        const zigzag = [
          at(-reach, 0),
          at(-reach / 3, -reach / 2),
          at(reach / 3, reach / 2),
          at(reach, 0),
        ];

        marks.push(
          svgNode("polyline", {
            fill: "none",
            stroke: this.appearance.ink,
            "stroke-width": lineWidth,
            "stroke-linejoin": "round",
            points: zigzag
              .map(
                (point) =>
                  `${String(roundTo(point.x))},${String(roundTo(point.y))}`,
              )
              .join(" "),
          }),
        );
      } else {
        marks.push(
          svgNode(
            "g",
            { fill: this.appearance.ink, stroke: "none" },
            [-1, 0, 1].map((slot) => {
              const dot = at(slot * (reach * 0.6), 0);

              return svgNode("circle", {
                cx: roundTo(dot.x),
                cy: roundTo(dot.y),
                r: roundTo(radius),
              });
            }),
          ),
        );
      }
    }

    return marks;
  }

  /** The way the line runs where it passes the given point. */
  private static directionAt(
    points: readonly Point[],
    x: number,
    y: number,
  ): "x" | "y" {
    let best: { along: "x" | "y"; distance: number } | undefined;

    points.slice(1).forEach((to, index) => {
      const from = points[index] ?? to;
      const horizontal = Math.abs(to.x - from.x) >= Math.abs(to.y - from.y);
      const distance = horizontal
        ? Math.abs(y - from.y) +
          Math.max(0, Math.min(from.x, to.x) - x, x - Math.max(from.x, to.x))
        : Math.abs(x - from.x) +
          Math.max(0, Math.min(from.y, to.y) - y, y - Math.max(from.y, to.y));

      if (best === undefined || distance < best.distance) {
        best = { along: horizontal ? "x" : "y", distance };
      }
    });

    return best?.along ?? "y";
  }

  /**
   * The key to the marks inside transfers of control: one row for each
   * letter, a small triangle and what the letter stands for.
   */
  private legend(
    diagram: FlowchartDiagram,
    body: Extent,
  ): { nodes: readonly SvgNode[]; maxX: number; maxY: number } {
    const meanings = new Map<string, string>();

    for (const node of diagram.nodes) {
      if (node.kind === "transfer" && node.legend !== undefined) {
        meanings.set(node.label, node.legend);
      }
    }

    if (meanings.size === 0) {
      return { nodes: [], maxX: body.maxX, maxY: body.maxY };
    }

    const { textStyle, padding, layerSpacing } = this.metrics;
    const size = textStyle.size * textStyle.lineHeight * 2.4;
    const shapes: SvgNode[] = [];
    const texts: SvgNode[] = [];
    let y = body.maxY + layerSpacing;
    let maxX = body.maxX;

    for (const [mark, meaning] of meanings) {
      const triangle = {
        x: body.minX,
        y,
        width: size * (Math.sqrt(3) / 2),
        height: size,
      };
      const text = `- ${meaning}`;
      const wide = this.measurer.measure(text, textStyle).width;

      shapes.push(
        svgNode("polygon", {
          points: triangleCorners(triangle, Side.Right)
            .map(([px, py]) => `${String(roundTo(px))},${String(roundTo(py))}`)
            .join(" "),
        }),
      );
      texts.push(
        this.textBlock(mark, body.minX + triangle.width / 3, y + size / 2),
        this.textBlock(
          text,
          body.minX + triangle.width + padding,
          y + size / 2,
          "start",
        ),
      );
      maxX = Math.max(maxX, body.minX + triangle.width + padding + wide);
      y += size + padding;
    }

    return {
      nodes: [
        svgNode(
          "g",
          {
            fill: this.appearance.fill,
            stroke: this.appearance.ink,
            "stroke-width": this.metrics.lineWidth,
            "stroke-linejoin": "round",
          },
          shapes,
        ),
        svgNode(
          "g",
          {
            fill: this.appearance.ink,
            stroke: "none",
            "font-family": this.metrics.fontFamily,
            "font-size": textStyle.size,
            "text-anchor": "middle",
            "dominant-baseline": "central",
          },
          texts,
        ),
      ],
      maxX,
      maxY: y - padding,
    };
  }

  /** The area covered by blocks, frames, lines and text. */
  private extentOf(
    layout: LayoutResult,
    labels: readonly PlacedLabel[],
    captions: readonly Caption[],
  ): Extent {
    let minX = 0;
    let minY = 0;
    let maxX = layout.size.width;
    let maxY = layout.size.height;

    const cover = (rect: Rect): void => {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    };

    for (const rect of [
      ...layout.nodes.values(),
      ...(layout.groups?.values() ?? []),
    ]) {
      cover(rect);
    }

    for (const label of labels) {
      const pad = label.inline ? this.metrics.padding / 2 : 0;

      minX = Math.min(minX, label.cx - label.size.width / 2 - pad);
      minY = Math.min(minY, label.cy - label.size.height / 2 - pad);
      maxX = Math.max(maxX, label.cx + label.size.width / 2 + pad);
      maxY = Math.max(maxY, label.cy + label.size.height / 2 + pad);
    }

    for (const caption of captions) {
      cover({
        x: caption.anchor === "start" ? caption.x : caption.x - caption.width,
        y: caption.y - caption.height / 2,
        width: caption.width,
        height: caption.height,
      });
    }

    return { minX, minY, maxX, maxY };
  }

  /** Text outside the blocks: frame titles, identifiers and descriptions. */
  private captions(
    diagram: FlowchartDiagram,
    layout: LayoutResult,
  ): readonly Caption[] {
    const gap = this.metrics.padding / 2;
    const make = (
      text: string,
      x: number,
      anchor: "start" | "end",
      place: (height: number) => number,
    ): Caption => {
      const size = this.measurer.measure(text, this.metrics.textStyle);

      return {
        text,
        x,
        y: place(size.height),
        anchor,
        width: size.width,
        height: size.height,
      };
    };
    const captions: Caption[] = [];

    for (const group of diagram.groups) {
      const bounds = layout.groups?.get(group.id);

      if (bounds !== undefined && group.title !== undefined) {
        captions.push(
          make(
            group.title,
            bounds.x + this.metrics.padding,
            "start",
            (height) => bounds.y + gap + height / 2,
          ),
        );
      }
    }

    for (const node of diagram.nodes) {
      const bounds = layout.nodes.get(node.id);

      if (bounds === undefined) {
        continue;
      }

      const above = (height: number): number => bounds.y - gap - height / 2;
      const below = (height: number): number =>
        bounds.y + bounds.height + gap + height / 2;

      if (node.ident !== undefined) {
        captions.push(make(node.ident, bounds.x, "start", above));
      }

      if (node.desc !== undefined) {
        captions.push(make(node.desc, bounds.x + bounds.width, "end", above));
      }

      if (node.input !== undefined) {
        captions.push(make(node.input, bounds.x + bounds.width, "end", below));
      }
    }

    return captions;
  }

  private edgeLabels(
    diagram: FlowchartDiagram,
    layout: LayoutResult,
    hops: ReadonlyMap<EdgeId, readonly Hop[]>,
    routed: LayoutResult,
  ): { labels: readonly PlacedLabel[]; cramped: readonly Stretch[] } {
    const placer = new LabelPlacer({
      padding: this.metrics.padding,
      stub: this.metrics.stub,
      jumpRadius: this.metrics.jumpRadius,
      arrowLength: this.metrics.arrowLength,
    });
    const arches = [...hops.values()].flatMap((list) =>
      list.map((hop) => hop.at),
    );
    const placed: PlacedLabel[] = [];
    const cramped: Stretch[] = [];
    const inline = this.metrics.labelStyle === "inline";

    for (const edge of diagram.edges) {
      const points = layout.edges.get(edge.id);

      if ((edge.skip || edge.channel) && points !== undefined) {
        const room = this.metrics.markLength + this.metrics.markClearance * 2;
        const mark = {
          id: edge.id,
          points,
          fullPoints: routed.edges.get(edge.id),
          arrow: edge.arrow,
          text: "",
          size: { width: room, height: room },
        };
        const surroundings = {
          nodes: layout.nodes,
          edges: layout.edges,
          hops: arches,
          placed,
        };
        const spot = placer.placeInline(mark, surroundings);

        if (spot !== undefined) {
          placed.push({
            ...spot,
            mark: { edge: edge.id, kind: edge.channel ? "channel" : "skip" },
          });

          const stretch = placer.isCrowded(spot, mark, surroundings)
            ? placer.stretchFor(mark, true)
            : undefined;

          if (stretch !== undefined) {
            cramped.push(stretch);
          }
        }

        continue;
      }

      if (edge.label === undefined || points === undefined) {
        continue;
      }

      const line = {
        id: edge.id,
        points,
        fullPoints: routed.edges.get(edge.id),
        arrow: edge.arrow,
        text: edge.label,
        size: this.measurer.measure(edge.label, this.metrics.textStyle),
      };
      const surroundings = {
        nodes: layout.nodes,
        edges: layout.edges,
        hops: arches,
        placed,
      };
      const label = inline
        ? placer.placeInline(line, surroundings)
        : placer.placeBeside(line, surroundings);

      if (label === undefined) {
        continue;
      }

      const stretch = placer.isCrowded(label, line, surroundings)
        ? placer.stretchFor(line, inline)
        : undefined;

      if (stretch !== undefined) {
        cramped.push(stretch);
      }

      placed.push(label);
    }

    return { labels: placed, cramped };
  }

  /** Solid patches that keep a line from running through its own label. */
  private labelBackdropLayer(
    labels: readonly PlacedLabel[],
  ): readonly SvgNode[] {
    const inline = labels.filter(
      (label) => label.inline && label.mark === undefined,
    );

    if (inline.length === 0) {
      return [];
    }

    const pad = this.metrics.padding / 2;

    return [
      svgNode(
        "g",
        { fill: this.appearance.labelBackground, stroke: "none" },
        inline.map((label) =>
          svgNode("rect", {
            "data-label": label.text,
            x: roundTo(label.cx - label.size.width / 2 - pad),
            y: roundTo(label.cy - label.size.height / 2 - pad),
            width: roundTo(label.size.width + pad * 2),
            height: roundTo(label.size.height + pad * 2),
          }),
        ),
      ),
    ];
  }

  private textLayer(
    diagram: FlowchartDiagram,
    shapes: ReadonlyMap<NodeId, Shape>,
    layout: LayoutResult,
    labels: readonly PlacedLabel[],
    captions: readonly Caption[],
  ): SvgNode {
    const texts: SvgNode[] = [];

    for (const node of diagram.nodes) {
      const bounds = layout.nodes.get(node.id);
      const shape = shapes.get(node.id);

      if (bounds === undefined || shape === undefined) {
        continue;
      }

      const front = this.frame.front(node, bounds);
      const band = this.frame.band(node);

      if (shape.showsText && node.label !== "") {
        const center = shape.labelCenter(front);

        texts.push(
          this.aligned(
            node.label,
            center.x,
            center.y + band / 2,
            shape.textAlign,
          ),
        );
      }

      if (node.ref !== undefined) {
        texts.push(
          this.textBlock(
            node.ref,
            front.x + front.width / 2,
            front.y + band / 2,
          ),
        );
      }
    }

    for (const label of labels.filter(
      (candidate) => candidate.mark === undefined,
    )) {
      texts.push(this.textBlock(label.text, label.cx, label.cy));
    }

    for (const caption of captions) {
      texts.push(
        this.textBlock(caption.text, caption.x, caption.y, caption.anchor),
      );
    }

    const { textStyle } = this.metrics;

    return svgNode(
      "g",
      {
        fill: this.appearance.ink,
        stroke: "none",
        "font-family": this.metrics.fontFamily,
        "font-size": textStyle.size,
        "text-anchor": "middle",
        "dominant-baseline": "central",
      },
      texts,
    );
  }

  /** Text set against the left or right edge of the box centred on `cx`. */
  private aligned(
    text: string,
    cx: number,
    cy: number,
    align: "start" | "middle" | "end",
  ): SvgNode {
    if (align === "middle") {
      return this.textBlock(text, cx, cy);
    }

    const half = this.measurer.measure(text, this.metrics.textStyle).width / 2;

    return align === "start"
      ? this.textBlock(text, cx - half, cy, "start")
      : this.textBlock(text, cx + half, cy, "end");
  }

  private textBlock(
    text: string,
    cx: number,
    cy: number,
    anchor?: "start" | "end",
  ): SvgNode {
    const lines = text.split("\n");
    const { size, lineHeight } = this.metrics.textStyle;
    const step = size * lineHeight;
    const first = cy - ((lines.length - 1) * step) / 2;

    return svgNode(
      "text",
      anchor === undefined ? {} : { "text-anchor": anchor },
      lines.map((line, index) =>
        svgNode("tspan", { x: roundTo(cx), y: roundTo(first + index * step) }, [
          line,
        ]),
      ),
    );
  }
}
