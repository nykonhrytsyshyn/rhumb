import {
  type DiagramEdge,
  type DiagramNode,
  type EdgeId,
  type FlowchartDiagram,
  type NodeId,
  Side,
} from "@rhumb/kernel";
import type { SideChoice, StandardProfile } from "@rhumb/profiles";

import { FlowGraph } from "./FlowGraph";
import type { Orientation, SideLean } from "./Orientation";

export interface PlannedSides {
  readonly fromSide: Side;
  readonly toSide: Side;
}

/** Sides chosen for the lines of one block, by line. */
interface BlockSides {
  readonly entering: ReadonlyMap<EdgeId, Side>;
  readonly leaving: ReadonlyMap<EdgeId, Side>;
}

/** A part a side plays for a block, such as "entry" or "yes". */
interface Role {
  readonly key: string;
  /** Sides the role may take, the most welcome first. */
  readonly candidates: readonly Side[];
  /** Extra cost of a side, for roles that know where their line is heading. */
  readonly extra?: (side: Side) => number;
}

/** Cost of sending a line to a side other than the one it should arrive at. */
const WRONG_SIDE = 10;

/** Which side of an open choice each part of a block tries first. */
const LEANS = {
  entry: { side: "left", vertical: "top" },
  yes: { side: "left", vertical: "bottom" },
  no: { side: "right", vertical: "bottom" },
  repeat: { side: "left", vertical: "bottom" },
  return: { side: "left", vertical: "top" },
  exit: { side: "right", vertical: "bottom" },
} as const satisfies Record<string, SideLean>;

/** Decides which side of each block every line leaves and enters. */
export class PortPlanner {
  public constructor(
    private readonly profile: StandardProfile,
    private readonly orientation: Orientation,
  ) {}

  public plan(diagram: FlowchartDiagram): ReadonlyMap<EdgeId, PlannedSides> {
    const graph = new FlowGraph(
      diagram.edges,
      diagram.nodes.map((node) => node.id),
    );
    const returnTargets = diagram.nodes.filter((node) =>
      PortPlanner.isReturnTarget(node, diagram, graph),
    );
    const plans = new Map<NodeId, BlockSides>();

    // Preparation blocks go first: decisions steer their lines to them.
    for (const node of returnTargets) {
      plans.set(node.id, this.planPreparation(node, diagram, graph));
    }

    for (const node of diagram.nodes) {
      if (plans.has(node.id)) {
        continue;
      }

      plans.set(
        node.id,
        node.kind === "decision"
          ? this.planDecision(node, diagram, graph, plans)
          : this.planFlow(node, diagram),
      );
    }

    return new Map(
      diagram.edges.map((edge) => [
        edge.id,
        {
          fromSide:
            plans.get(edge.from)?.leaving.get(edge.id) ?? this.flowOut(),
          toSide: plans.get(edge.to)?.entering.get(edge.id) ?? this.flowIn(),
        },
      ]),
    );
  }

  /** A preparation block that some path leads back to is a return target. */
  private static isReturnTarget(
    node: DiagramNode,
    diagram: FlowchartDiagram,
    graph: FlowGraph,
  ): boolean {
    return (
      node.kind === "preparation" &&
      diagram.edges.some((edge) => edge.to === node.id && graph.isBack(edge))
    );
  }

  private flowIn(): Side {
    return this.orientation.map(Side.Top);
  }

  private flowOut(): Side {
    return this.orientation.map(Side.Bottom);
  }

  private planFlow(node: DiagramNode, diagram: FlowchartDiagram): BlockSides {
    return {
      entering: new Map(
        PortPlanner.into(node, diagram).map((edge) => [edge.id, this.flowIn()]),
      ),
      leaving: new Map(
        PortPlanner.from(node, diagram).map((edge) => [
          edge.id,
          this.flowOut(),
        ]),
      ),
    };
  }

  private static into(
    node: DiagramNode,
    diagram: FlowchartDiagram,
  ): readonly DiagramEdge[] {
    return diagram.edges.filter((edge) => edge.to === node.id);
  }

  private static from(
    node: DiagramNode,
    diagram: FlowchartDiagram,
  ): readonly DiagramEdge[] {
    return diagram.edges.filter((edge) => edge.from === node.id);
  }

  private role(key: string, choice: SideChoice, lean: SideLean): Role {
    return { key, candidates: this.orientation.options(choice, lean) };
  }

  /**
   * The flow enters one side; lines back to the block enter another; the line
   * into the repeated section leaves a third and every other line a fourth.
   */
  private planPreparation(
    node: DiagramNode,
    diagram: FlowchartDiagram,
    graph: FlowGraph,
  ): BlockSides {
    const { preparation } = this.profile;
    const incoming = PortPlanner.into(node, diagram);
    const outgoing = PortPlanner.from(node, diagram);
    const returning = (edge: DiagramEdge): boolean => graph.isBack(edge);
    const repeating = (edge: DiagramEdge): boolean =>
      !graph.isBack(edge) &&
      edge.to !== edge.from &&
      graph.leadsBackTo(edge.to, node.id);

    const roles: Role[] = [];

    if (incoming.some((edge) => !returning(edge))) {
      roles.push(this.role("entry", preparation.entry, LEANS.entry));
    }

    if (incoming.some(returning)) {
      roles.push(this.role("return", preparation.return, LEANS.return));
    }

    if (outgoing.some(repeating)) {
      roles.push(this.role("repeat", preparation.repeat, LEANS.repeat));
    }

    if (outgoing.some((edge) => !repeating(edge))) {
      roles.push(this.role("exit", preparation.exit, LEANS.exit));
    }

    const sides = PortPlanner.assign(roles);
    const side = (key: string): Side => sides.get(key) ?? this.flowIn();

    return {
      entering: new Map(
        incoming.map((edge) => [
          edge.id,
          side(returning(edge) ? "return" : "entry"),
        ]),
      ),
      leaving: new Map(
        outgoing.map((edge) => [
          edge.id,
          side(repeating(edge) ? "repeat" : "exit"),
        ]),
      ),
    };
  }

  /**
   * Labelled branches take the profile's yes and no roles; the rest fill the
   * roles that stay free. A branch that goes back to a preparation block
   * leaves on the side where that block takes returning lines, which keeps
   * the line short and out of the way of the block's other lines.
   */
  private planDecision(
    node: DiagramNode,
    diagram: FlowchartDiagram,
    graph: FlowGraph,
    plans: ReadonlyMap<NodeId, BlockSides>,
  ): BlockSides {
    const { decision } = this.profile;
    const incoming = PortPlanner.into(node, diagram);
    const outgoing = PortPlanner.from(node, diagram);
    const branches = PortPlanner.assignBranches(outgoing, decision);

    const roles: Role[] = [this.role("entry", decision.entry, LEANS.entry)];

    branches.forEach((edge, index) => {
      const key = `branch:${edge.id}`;
      const choice = index === 0 ? decision.yes.side : decision.no.side;
      const lean = index === 0 ? LEANS.yes : LEANS.no;
      const arrival = plans.get(edge.to)?.entering.get(edge.id);
      const goesBack = graph.isBack(edge);
      const base =
        index < 2
          ? this.role(key, choice, lean)
          : { key, candidates: this.anySide() };

      roles.push(
        goesBack && arrival !== undefined
          ? {
              ...base,
              extra: (side) => (side === arrival ? 0 : WRONG_SIDE),
            }
          : base,
      );
    });

    const sides = PortPlanner.assign(roles);
    const entry = sides.get("entry") ?? this.flowIn();

    return {
      entering: new Map(incoming.map((edge) => [edge.id, entry])),
      leaving: new Map(
        outgoing.map((edge) => [
          edge.id,
          sides.get(`branch:${edge.id}`) ?? this.flowOut(),
        ]),
      ),
    };
  }

  /** Sides in the order a branch beyond the second falls back on them. */
  private anySide(): readonly Side[] {
    return [Side.Bottom, Side.Right, Side.Left, Side.Top].map((side) =>
      this.orientation.map(side),
    );
  }

  /**
   * Orders branches so that the first takes the yes role and the second the
   * no role: labelled branches claim their role, the others fill the gaps.
   */
  private static assignBranches(
    outgoing: readonly DiagramEdge[],
    decision: StandardProfile["decision"],
  ): readonly DiagramEdge[] {
    let yes: DiagramEdge | undefined;
    let no: DiagramEdge | undefined;

    for (const edge of outgoing) {
      if (yes === undefined && PortPlanner.matches(edge, decision.yes.labels)) {
        yes = edge;
      } else if (
        no === undefined &&
        PortPlanner.matches(edge, decision.no.labels)
      ) {
        no = edge;
      }
    }

    const rest = outgoing.filter((edge) => edge !== yes && edge !== no);
    const first = yes ?? rest.shift();
    const second = no ?? rest.shift();

    return [first, second, ...rest].filter(
      (edge): edge is DiagramEdge => edge !== undefined,
    );
  }

  /**
   * Gives every role a side of its own at the lowest cost: a role pays for
   * each place it sits down the list of sides it would like.
   */
  private static assign(roles: readonly Role[]): ReadonlyMap<string, Side> {
    let best: { cost: number; sides: readonly Side[] } | undefined;
    const chosen: Side[] = [];

    const visit = (index: number, cost: number): void => {
      if (best !== undefined && cost >= best.cost) {
        return;
      }

      const role = roles[index];

      if (role === undefined) {
        best = { cost, sides: [...chosen] };

        return;
      }

      role.candidates.forEach((side, rank) => {
        if (chosen.includes(side)) {
          return;
        }

        chosen.push(side);
        visit(index + 1, cost + rank + (role.extra?.(side) ?? 0));
        chosen.pop();
      });
    };

    visit(0, 0);

    return new Map(
      roles.flatMap((role, index) => {
        const side = best?.sides[index] ?? role.candidates[0];

        return side === undefined ? [] : [[role.key, side] as const];
      }),
    );
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
