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
  describe("a single cycle", () => {
    const edges = [
      edge("a", "b"),
      edge("b", "c"),
      edge("c", "b"),
      edge("c", "d"),
    ];
    const graph = new FlowGraph(edges, ["a", "b", "c", "d"]);

    it("marks only the edge that returns", () => {
      expect(edges.map((item) => graph.isBack(item))).toEqual([
        false,
        false,
        true,
        false,
      ]);
    });

    it("finds a stretch that comes back to a block", () => {
      expect(graph.leadsBackTo("c", "b")).toBe(true);
      expect(graph.leadsBackTo("b", "b")).toBe(true);
    });

    it("does not count a way out as coming back", () => {
      expect(graph.leadsBackTo("d", "b")).toBe(false);
    });
  });

  describe("a loop inside a loop", () => {
    // A is the start; D opens the outer loop and F the inner one.
    const edges = [
      edge("A", "D"),
      edge("D", "E"),
      edge("E", "F"),
      edge("F", "G"),
      edge("G", "F"),
      edge("F", "H"),
      edge("H", "D"),
      edge("D", "Z"),
    ];
    const graph = new FlowGraph(edges, ["A", "D", "E", "F", "G", "H", "Z"]);

    it("marks the edge into the inner block as forward", () => {
      expect(graph.isBack(edge("E", "F"))).toBe(false);
      expect(graph.isBack(edge("G", "F"))).toBe(true);
      expect(graph.isBack(edge("H", "D"))).toBe(true);
    });

    it("does not send the inner exit back to the inner block", () => {
      expect(graph.leadsBackTo("G", "F")).toBe(true);
      expect(graph.leadsBackTo("H", "F")).toBe(false);
    });
  });

  it("walks from the start even when a block is declared early", () => {
    const edges = [edge("c", "a"), edge("start", "a"), edge("a", "c")];
    const graph = new FlowGraph(edges, ["c", "a", "start"]);

    expect(graph.isBack(edge("c", "a"))).toBe(true);
    expect(graph.isBack(edge("a", "c"))).toBe(false);
  });
});
