import type { DiagramEdge, NodeId } from "@rhumb/kernel";

/** Reachability queries over the edges of a diagram. */
export class FlowGraph {
  private readonly successors = new Map<NodeId, NodeId[]>();
  private readonly cache = new Map<string, boolean>();

  public constructor(edges: readonly DiagramEdge[]) {
    for (const edge of edges) {
      const list = this.successors.get(edge.from) ?? [];
      list.push(edge.to);
      this.successors.set(edge.from, list);
    }
  }

  /** True when at least one edge path leads from `from` to `to`. */
  public reaches(from: NodeId, to: NodeId): boolean {
    const key = `${from}\u0000${to}`;
    const cached = this.cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const result = this.search(from, to);

    this.cache.set(key, result);

    return result;
  }

  private search(from: NodeId, to: NodeId): boolean {
    const visited = new Set<NodeId>();
    const queue: NodeId[] = [...(this.successors.get(from) ?? [])];

    for (const current of queue) {
      if (current === to) {
        return true;
      }

      if (visited.has(current)) {
        continue;
      }

      visited.add(current);
      queue.push(...(this.successors.get(current) ?? []));
    }

    return false;
  }
}
