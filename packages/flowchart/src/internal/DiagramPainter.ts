import {
  type DiagramEdge,
  type FlowchartDiagram,
  type LayoutResult,
  type NodeId,
  type Point,
  type Shape,
  type SvgNode,
  type TextMeasurer,
  roundTo,
  svgNode,
} from "@rhumb/kernel";

import type { Appearance, RenderedDiagram } from "../api/render";
import type { Metrics } from "./Metrics";

const ARROW_ID = "rhumb-arrow";

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
    const width = roundTo(layout.size.width + margin * 2);
    const height = roundTo(layout.size.height + margin * 2);

    const content = svgNode(
      "g",
      { transform: `translate(${String(margin)} ${String(margin)})` },
      [
        this.edgeLayer(diagram, layout),
        this.nodeLayer(diagram, shapes, layout),
        this.textLayer(diagram, layout),
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
    const lines: SvgNode[] = [];
    for (const edge of diagram.edges) {
      const points = layout.edges.get(edge.id);

      if (points === undefined || points.length < 2) {
        continue;
      }

      lines.push(this.edgeLine(edge, points));
    }
    return svgNode(
      "g",
      { fill: "none", stroke: this.appearance.ink, "stroke-linejoin": "round" },
      lines,
    );
  }

  private edgeLine(edge: DiagramEdge, points: readonly Point[]): SvgNode {
    const attrs: Record<string, string | number> = {
      points: points
        .map(
          (point) => `${String(roundTo(point.x))},${String(roundTo(point.y))}`,
        )
        .join(" "),
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

    return svgNode("polyline", attrs);
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

  private textLayer(diagram: FlowchartDiagram, layout: LayoutResult): SvgNode {
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

    for (const edge of diagram.edges) {
      const points = layout.edges.get(edge.id);
      const label =
        points === undefined ? undefined : this.edgeLabel(edge, points);

      if (label !== undefined) {
        texts.push(label);
      }
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
  private edgeLabel(
    edge: DiagramEdge,
    points: readonly Point[],
  ): SvgNode | undefined {
    const [start, next, after] = points;

    if (edge.label === undefined || start === undefined || next === undefined) {
      return undefined;
    }

    const length = Math.hypot(next.x - start.x, next.y - start.y);

    if (length === 0) return undefined;

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

    return this.textBlock(
      edge.label,
      start.x + ux * along + nx * offset,
      start.y + uy * along + ny * offset,
    );
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
