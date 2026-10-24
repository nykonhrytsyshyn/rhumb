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

import { AnnotationPlacer } from "../../internal/AnnotationPlacer";
import { DiagramPainter } from "../../internal/DiagramPainter";
import { Metrics } from "../../internal/Metrics";
import { NodeFrame } from "../../internal/NodeFrame";
import { NodeSizer } from "../../internal/NodeSizer";
import { Orientation } from "../../internal/Orientation";
import { ParallelBars } from "../../internal/ParallelBars";
import { PortPlanner } from "../../internal/PortPlanner";
import { ParallelShape } from "../../internal/shapes";
import { ShapeFactory } from "../../internal/shapes";
import {
  type Appearance,
  PRINT_APPEARANCE,
  type RenderedDiagram,
} from "./types";

export interface FlowchartRendererOptions {
  readonly profile: StandardProfile;
  readonly layoutEngine: LayoutEngine;
  readonly measurer: TextMeasurer;
  readonly scale?: number;
  readonly appearance?: Partial<Appearance>;
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
  private readonly frame: NodeFrame;
  private readonly annotations: AnnotationPlacer;
  private readonly bars: ParallelBars;

  public constructor(private readonly options: FlowchartRendererOptions) {
    this.metrics = new Metrics(options.profile, options.scale ?? 4);
    this.sizer = new NodeSizer(this.metrics, options.measurer);
    this.frame = new NodeFrame(this.metrics);
    this.annotations = new AnnotationPlacer(this.metrics, this.sizer);
    this.bars = new ParallelBars(this.metrics);
    this.painter = new DiagramPainter(this.metrics, options.measurer, {
      ...PRINT_APPEARANCE,
      ...options.appearance,
    });
  }

  public async render(diagram: FlowchartDiagram): Promise<RenderedDiagram> {
    const shapes = new Map<NodeId, Shape>(
      diagram.nodes.map((node) => [node.id, this.shapes.create(node)]),
    );

    for (const shape of shapes.values()) {
      shape.alongFlow(diagram.direction);

      if (shape instanceof ParallelShape) {
        shape.gauge(this.metrics.parallelGap, this.metrics.parallelMargin);
      }
    }

    const laid = await this.options.layoutEngine.layout(
      this.buildRequest(AnnotationPlacer.withoutNotes(diagram), shapes),
    );
    const stretched = this.bars.stretch(diagram, shapes, laid);
    const layout = this.annotations.place(diagram, shapes, stretched);

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
            ports: shape.ports(this.frame.frontAtOrigin(node, size)),
            ...(node.group === undefined ? {} : { group: node.group }),
          },
        ];
      }),
      ...(diagram.nodes.some((node) => node.kind === "parallel")
        ? { earlyRows: true }
        : {}),
      groups: diagram.groups.map((group) => ({
        id: group.id,
        ...(group.parent === undefined ? {} : { parent: group.parent }),
        padding: this.framePadding(group.title),
      })),
      edges: diagram.edges.flatMap((edge) => {
        const planned = sides.get(edge.id);

        return planned === undefined
          ? []
          : [{ id: edge.id, from: edge.from, to: edge.to, ...planned }];
      }),
    };
  }

  /** Space a frame keeps free around its members; a title takes more on top. */
  private framePadding(title: string | undefined): {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
  } {
    const room = this.metrics.framePadding;
    const heading =
      title === undefined
        ? 0
        : this.options.measurer.measure(title, this.metrics.textStyle).height +
          this.metrics.padding;

    return { top: room + heading, right: room, bottom: room, left: room };
  }
}
