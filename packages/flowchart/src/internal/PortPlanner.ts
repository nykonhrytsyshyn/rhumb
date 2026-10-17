import {
  type DiagramEdge,
  type DiagramNode,
  type EdgeId,
  type FlowchartDiagram,
  type NodeId,
  Side,
} from "@rhumb/kernel";
import type { StandardProfile } from "@rhumb/profiles";

import { FlowGraph } from "./FlowGraph";
import type { Orientation } from "./Orientation";

export interface PlannedSides {
  readonly fromSide: Side;
  readonly toSide: Side;
}

const ALL_SIDES: readonly Side[] = [
  Side.Top,
  Side.Right,
  Side.Bottom,
  Side.Left,
];

/** Decides which side of each block every line leaves and enters. */
export class PortPlanner {
  public constructor(
    private readonly profile: StandardProfile,
    private readonly orientation: Orientation,
  ) {}

  public plan(diagram: FlowchartDiagram): ReadonlyMap<EdgeId, PlannedSides> {
    const graph = new FlowGraph(diagram.edges);
    const nodes = new Map<NodeId, DiagramNode>(
      diagram.nodes.map((node) => [node.id, node]),
    );
    const returnTargets = new Set<NodeId>(
      diagram.nodes
        .filter((node) => PortPlanner.isReturnTarget(node, diagram, graph))
        .map((node) => node.id),
    );

    const exits = new Map<EdgeId, Side>();

    for (const node of diagram.nodes) {
      const outgoing = diagram.edges.filter((edge) => edge.from === node.id);
      const sides: ReadonlyMap<EdgeId, Side> =
        node.kind === "decision"
          ? this.planDecision(outgoing)
          : returnTargets.has(node.id)
            ? this.planPreparationExits(outgoing, graph)
            : new Map(outgoing.map((edge) => [edge.id, this.flowOut()]));

      sides.forEach((side, edgeId) => exits.set(edgeId, side));
    }

    const result = new Map<EdgeId, PlannedSides>();

    for (const edge of diagram.edges) {
      const target = nodes.get(edge.to);

      result.set(edge.id, {
        fromSide: exits.get(edge.id) ?? this.flowOut(),
        toSide: this.entrySide(edge, target, returnTargets, graph),
      });
    }

    return result;
  }

  /** A preparation block that some path leads back to is a return target. */
  private static isReturnTarget(
    node: DiagramNode,
    diagram: FlowchartDiagram,
    graph: FlowGraph,
  ): boolean {
    return (
      node.kind === "preparation" &&
      diagram.edges.some(
        (edge) =>
          edge.from === node.id &&
          edge.to !== node.id &&
          graph.reaches(edge.to, node.id),
      )
    );
  }

  private flowIn(): Side {
    return this.orientation.map(Side.Top);
  }

  private flowOut(): Side {
    return this.orientation.map(Side.Bottom);
  }

  private entrySide(
    edge: DiagramEdge,
    target: DiagramNode | undefined,
    returnTargets: ReadonlySet<NodeId>,
    graph: FlowGraph,
  ): Side {
    if (target === undefined) {
      return this.flowIn();
    }

    if (target.kind === "decision") {
      return this.orientation.mapProfileSide(this.profile.decision.entry);
    }

    if (returnTargets.has(target.id)) {
      const { preparation } = this.profile;
      const returning =
        edge.from !== target.id && graph.reaches(target.id, edge.from);

      return this.orientation.mapProfileSide(
        returning ? preparation.return : preparation.entry,
      );
    }
    return this.flowIn();
  }

  /** Lines into the repeated section leave one side, all others exit. */
  private planPreparationExits(
    outgoing: readonly DiagramEdge[],
    graph: FlowGraph,
  ): Map<EdgeId, Side> {
    const { preparation } = this.profile;
    const repeat = this.orientation.mapProfileSide(preparation.repeat);
    const exit = this.orientation.mapProfileSide(preparation.exit);

    return new Map(
      outgoing.map((edge) => [
        edge.id,
        edge.to !== edge.from && graph.reaches(edge.to, edge.from)
          ? repeat
          : exit,
      ]),
    );
  }

  private planDecision(outgoing: readonly DiagramEdge[]): Map<EdgeId, Side> {
    const { decision } = this.profile;
    const entry = this.orientation.mapProfileSide(decision.entry);
    const yes = this.orientation.mapProfileSide(decision.yes.side);
    const no = this.orientation.mapProfileSide(decision.no.side);
    const extra =
      ALL_SIDES.find((side) => side !== entry && side !== yes && side !== no) ??
      yes;

    const result = new Map<EdgeId, Side>();
    const taken = new Set<Side>();
    const claim = (edge: DiagramEdge, side: Side): void => {
      result.set(edge.id, side);
      taken.add(side);
    };

    for (const edge of outgoing) {
      if (PortPlanner.matches(edge, decision.yes.labels) && !taken.has(yes)) {
        claim(edge, yes);
      } else if (
        PortPlanner.matches(edge, decision.no.labels) &&
        !taken.has(no)
      ) {
        claim(edge, no);
      }
    }

    const free = [yes, no, extra].filter((side) => !taken.has(side));

    for (const edge of outgoing) {
      if (!result.has(edge.id)) {
        claim(edge, free.shift() ?? extra);
      }
    }

    return result;
  }

  private static matches(
    edge: DiagramEdge,
    labels: readonly string[],
  ): boolean {
    const label = edge.label?.trim().toLowerCase();

    return (
      label !== undefined && labels.some((item) => item.toLowerCase() === label)
    );
  }
}
