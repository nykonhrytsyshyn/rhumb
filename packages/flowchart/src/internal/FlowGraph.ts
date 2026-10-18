import type { DiagramEdge, EdgeId, NodeId } from "@rhumb/kernel";

/**
 * The edges of a diagram, told apart into forward edges and back edges: an
 * edge is a back edge when it returns to a block that the walk from the
 * start of the diagram is still inside of. Reachability alone cannot tell
 * them apart, since every block inside an outer loop reaches every other.
 */
export class FlowGraph {
  private readonly out = new Map<NodeId, DiagramEdge[]>();
  private readonly back = new Set<EdgeId>();
  private readonly cache = new Map<string, boolean>();

  public constructor(
    edges: readonly DiagramEdge[],
    nodeIds: readonly NodeId[] = [],
  ) {
    for (const edge of edges) {
      this.out.set(edge.from, [...(this.out.get(edge.from) ?? []), edge]);
    }

    const entered = new Set(edges.map((edge) => edge.to));
    const roots = [
      ...nodeIds.filter((id) => !entered.has(id)),
      ...nodeIds.filter((id) => entered.has(id)),
      ...edges.map((edge) => edge.from),
    ];
    const state = new Map<NodeId, "open" | "done">();

    for (const root of roots) {
      if (!state.has(root)) {
        this.walk(root, state);
      }
    }
  }

  /** Depth-first walk that marks the edges returning to an open block. */
  private walk(root: NodeId, state: Map<NodeId, "open" | "done">): void {
    state.set(root, "open");

    const stack = [{ node: root, next: 0 }];

    for (let top = stack.at(-1); top !== undefined; top = stack.at(-1)) {
      const edge = this.out.get(top.node)?.[top.next];

      if (edge === undefined) {
        state.set(top.node, "done");
        stack.pop();
        continue;
      }

      top.next += 1;

      const seen = state.get(edge.to);

      if (seen === "open") {
        this.back.add(edge.id);
      } else if (seen === undefined) {
        state.set(edge.to, "open");
        stack.push({ node: edge.to, next: 0 });
      }
    }
  }

  /** True when the edge returns to a block that was entered before it. */
  public isBack(edge: DiagramEdge): boolean {
    return this.back.has(edge.id);
  }

  /**
   * True when, from `from`, following forward edges only, a back edge to
   * `target` can be reached: that is, `from` begins a stretch of the diagram
   * that comes back to `target`.
   */
  public leadsBackTo(from: NodeId, target: NodeId): boolean {
    const key = `${from}\u0000${target}`;
    const cached = this.cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const visited = new Set<NodeId>([from]);
    const queue: NodeId[] = [from];
    let found = false;

    for (const current of queue) {
      for (const edge of this.out.get(current) ?? []) {
        if (this.back.has(edge.id)) {
          found ||= edge.to === target;
        } else if (!visited.has(edge.to)) {
          visited.add(edge.to);
          queue.push(edge.to);
        }
      }
    }

    this.cache.set(key, found);

    return found;
  }
}
