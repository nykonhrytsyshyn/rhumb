import {
  type DiagramEdge,
  type FlowchartDiagram,
  type LayoutResult,
  type NodeId,
  type Point,
  type Shape,
  type Size,
  type SvgNode,
  type TextMeasurer,
  roundTo,
  svgNode,
} from "@rhumb/kernel";

import type { Appearance, RenderedDiagram } from "../api/render/types";
import { CrossingFinder, type Hop, type RoutedEdge } from "./EdgeCrossings";
import { buildEdgePath } from "./EdgePath";
import type { Metrics } from "./Metrics";

const ARROW_ID = "rhumb-arrow";

/** A line label whose position has been decided. */
interface PlacedLabel {
  readonly text: string;
  readonly cx: number;
  readonly cy: number;
  readonly size: Size;
}

interface Extent {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

/** Turns a computed layout into the final SVG tree. */
export class DiagramPainter {
  public constructor(
    private readonly metrics: Metrics,
    private readonly measurer: TextMeasurer,
    private readonly appearance: Appearance,
  ) {}

  public paint(
    diagram: FlowchartDiagram,
    shapes: ReadonlyMap<NodeId, Shape>,
    layout: LayoutResult,
  ): RenderedDiagram {
    const { margin } = this.metrics;
    const labels = this.edgeLabels(diagram, layout);
    const extent = DiagramPainter.extentOf(layout, labels);
    const width = roundTo(extent.maxX - extent.minX + margin * 2);
    const height = roundTo(extent.maxY - extent.minY + margin * 2);
    const shiftX = roundTo(margin - extent.minX);
    const shiftY = roundTo(margin - extent.minY);

    const content = svgNode(
      "g",
      { transform: `translate(${String(shiftX)} ${String(shiftY)})` },
      [
        this.edgeLayer(diagram, layout),
        this.nodeLayer(diagram, shapes, layout),
        this.textLayer(diagram, layout, labels),
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

  private edgeLayer(diagram: FlowchartDiagram, layout: LayoutResult): SvgNode {
    const routed: RoutedEdge[] = [];

    for (const edge of diagram.edges) {
      const points = layout.edges.get(edge.id);

      if (points === undefined || points.length < 2) {
        continue;
      }

      routed.push({ id: edge.id, from: edge.from, to: edge.to, points });
    }

    const hops = new CrossingFinder(this.metrics.jumpRadius).find(routed);
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

    for (const node of diagram.nodes) {
      const shape = shapes.get(node.id);
      const bounds = layout.nodes.get(node.id);

      if (shape === undefined || bounds === undefined) {
        continue;
      }

      drawn.push(shape.draw(bounds));
    }

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

  /** The area covered by blocks, lines and labels, labels included. */
  private static extentOf(
    layout: LayoutResult,
    labels: readonly PlacedLabel[],
  ): Extent {
    let minX = 0;
    let minY = 0;
    let maxX = layout.size.width;
    let maxY = layout.size.height;

    for (const label of labels) {
      minX = Math.min(minX, label.cx - label.size.width / 2);
      minY = Math.min(minY, label.cy - label.size.height / 2);
      maxX = Math.max(maxX, label.cx + label.size.width / 2);
      maxY = Math.max(maxY, label.cy + label.size.height / 2);
    }

    return { minX, minY, maxX, maxY };
  }

  private edgeLabels(
    diagram: FlowchartDiagram,
    layout: LayoutResult,
  ): readonly PlacedLabel[] {
    return diagram.edges.flatMap((edge) => {
      const points = layout.edges.get(edge.id);
      const label =
        points === undefined ? undefined : this.placeLabel(edge, points);

      return label === undefined ? [] : [label];
    });
  }

  private textLayer(
    diagram: FlowchartDiagram,
    layout: LayoutResult,
    labels: readonly PlacedLabel[],
  ): SvgNode {
    const texts: SvgNode[] = [];

    for (const node of diagram.nodes) {
      const bounds = layout.nodes.get(node.id);

      if (bounds === undefined) {
        continue;
      }

      texts.push(
        this.textBlock(
          node.label,
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
        ),
      );
    }

    for (const label of labels) {
      texts.push(this.textBlock(label.text, label.cx, label.cy));
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

  /**
   * Puts a label beside the first segment of a line, close to its source and
   * on the side away from where the line turns, so that it never crosses it.
   */
  private placeLabel(
    edge: DiagramEdge,
    points: readonly Point[],
  ): PlacedLabel | undefined {
    const [start, next, after] = points;

    if (edge.label === undefined || start === undefined || next === undefined) {
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

    const text = this.measurer.measure(edge.label, this.metrics.textStyle);
    const gap = this.metrics.padding;
    const along =
      Math.abs(ux) * (text.width / 2) + Math.abs(uy) * (text.height / 2) + gap;
    const offset =
      Math.abs(nx) * (text.width / 2) + Math.abs(ny) * (text.height / 2) + gap;

    return {
      text: edge.label,
      cx: start.x + ux * along + nx * offset,
      cy: start.y + uy * along + ny * offset,
      size: text,
    };
  }

  private textBlock(text: string, cx: number, cy: number): SvgNode {
    const lines = text.split("\n");
    const { size, lineHeight } = this.metrics.textStyle;
    const step = size * lineHeight;
    const first = cy - ((lines.length - 1) * step) / 2;

    return svgNode(
      "text",
      {},
      lines.map((line, index) =>
        svgNode("tspan", { x: roundTo(cx), y: roundTo(first + index * step) }, [
          line,
        ]),
      ),
    );
  }
}
