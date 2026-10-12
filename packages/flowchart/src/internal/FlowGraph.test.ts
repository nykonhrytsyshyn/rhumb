import { describe, expect, it } from "vitest";

import type { DiagramEdge } from "@rhumb/kernel";

import { FlowGraph } from "./FlowGraph";

function edge(from: string, to: string): DiagramEdge {
  return {
    id: `${from}-${to}`,
    from,
    to,
    label: undefined,
    line: "solid",
    arrow: true,
  };
}

describe("FlowGraph", () => {
  const graph = new FlowGraph([
    edge("a", "b"),
    edge("b", "c"),
    edge("c", "b"),
    edge("c", "d"),
  ]);

  it("follows paths of any length", () => {
    expect(graph.reaches("a", "d")).toBe(true);
    expect(graph.reaches("b", "c")).toBe(true);
  });

  it("respects edge direction", () => {
    expect(graph.reaches("d", "a")).toBe(false);
    expect(graph.reaches("a", "a")).toBe(false);
  });

  it("detects cycles through a node", () => {
    expect(graph.reaches("b", "b")).toBe(true);
  });

  it("terminates on cycles and caches answers", () => {
    expect(graph.reaches("a", "missing")).toBe(false);
    expect(graph.reaches("a", "missing")).toBe(false);
  });
});
