import {
  type Direction,
  type FlowchartDiagram,
  type LayoutDirection,
  type LayoutEngine,
  type LayoutRequest,
  type NodeId,
  type Shape,
  type TextMeasurer,
} from "@rhumb/kernel";
import type { StandardProfile } from "@rhumb/profiles";

import { DiagramPainter } from "../../internal/DiagramPainter";
import { Metrics } from "../../internal/Metrics";
import { NodeSizer } from "../../internal/NodeSizer";
import { Orientation } from "../../internal/Orientation";
import { PortPlanner } from "../../internal/PortPlanner";
import { ShapeFactory } from "../../internal/shapes";
import {
  type Appearance,
  type LabelStyle,
  PRINT_APPEARANCE,
  type RenderedDiagram,
} from "./types";

export interface FlowchartRendererOptions {
  readonly profile: StandardProfile;
  readonly layoutEngine: LayoutEngine;
  readonly measurer: TextMeasurer;
  readonly scale?: number;
  readonly appearance?: Partial<Appearance>;
  /** Placement of line labels; defaults to beside the line. */
  readonly labelStyle?: LabelStyle;
}

const LAYOUT_DIRECTIONS: Readonly<Record<Direction, LayoutDirection>> = {
  TB: "down",
  BT: "up",
  LR: "right",
  RL: "left",
};

export class FlowchartRenderer {
  private readonly metrics: Metrics;
  private readonly sizer: NodeSizer;
  private readonly painter: DiagramPainter;
  private readonly shapes = new ShapeFactory();

  public constructor(private readonly options: FlowchartRendererOptions) {
    this.metrics = new Metrics(options.profile, options.scale ?? 4);
    this.sizer = new NodeSizer(this.metrics, options.measurer);
    this.painter = new DiagramPainter(
      this.metrics,
      options.measurer,
      { ...PRINT_APPEARANCE, ...options.appearance },
      options.labelStyle ?? "beside",
    );
  }

  public async render(diagram: FlowchartDiagram): Promise<RenderedDiagram> {
    const shapes = new Map<NodeId, Shape>(
      diagram.nodes.map((node) => [node.id, this.shapes.create(node)]),
    );
    const layout = await this.options.layoutEngine.layout(
      this.buildRequest(diagram, shapes),
    );

    return this.painter.paint(diagram, shapes, layout);
  }

  private buildRequest(
    diagram: FlowchartDiagram,
    shapes: ReadonlyMap<NodeId, Shape>,
  ): LayoutRequest {
    const orientation = Orientation.of(diagram.direction);
    const sides = new PortPlanner(this.options.profile, orientation).plan(
      diagram,
    );

    return {
      direction: LAYOUT_DIRECTIONS[diagram.direction],
      nodeSpacing: this.metrics.nodeSpacing,
      layerSpacing: this.metrics.layerSpacing,
      edgeClearance: Math.max(this.metrics.clearance, this.metrics.stub),
      edgeSpacing: this.metrics.lineSpacing,
      nodes: diagram.nodes.flatMap((node) => {
        const shape = shapes.get(node.id);

        if (shape === undefined) {
          return [];
        }

        const size = this.sizer.size(node, shape);

        return [
          {
            id: node.id,
            size,
            ports: shape.ports({ x: 0, y: 0, ...size }),
          },
        ];
      }),
      edges: diagram.edges.flatMap((edge) => {
        const planned = sides.get(edge.id);

        return planned === undefined
          ? []
          : [{ id: edge.id, from: edge.from, to: edge.to, ...planned }];
      }),
    };
  }
}
