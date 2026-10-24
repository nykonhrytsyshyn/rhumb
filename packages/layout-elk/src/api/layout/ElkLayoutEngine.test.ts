import type { ELK as ElkApi, ElkNode } from "elkjs/lib/elk-api";
import ELK from "elkjs/lib/elk.bundled.js";
import { describe, expect, it } from "vitest";

import { type LayoutRequest, Side } from "@rhumb/kernel";

import { ElkLayoutEngine } from "./ElkLayoutEngine";

function allPorts(width: number, height: number) {
  return [
    { side: Side.Top, position: { x: width / 2, y: 0 } },
    { side: Side.Right, position: { x: width, y: height / 2 } },
    { side: Side.Bottom, position: { x: width / 2, y: height } },
    { side: Side.Left, position: { x: 0, y: height / 2 } },
  ];
}

const request: LayoutRequest = {
  direction: "down",
  nodeSpacing: 40,
  layerSpacing: 40,
  edgeClearance: 20,
  edgeSpacing: 12,
  nodes: [
    { id: "A", size: { width: 80, height: 40 }, ports: allPorts(80, 40) },
    { id: "B", size: { width: 80, height: 40 }, ports: allPorts(80, 40) },
    { id: "C", size: { width: 80, height: 40 }, ports: allPorts(80, 40) },
  ],
  edges: [
    { id: "e0", from: "A", to: "B", fromSide: Side.Bottom, toSide: Side.Top },
    { id: "e1", from: "A", to: "C", fromSide: Side.Right, toSide: Side.Top },
  ],
};

describe("ElkLayoutEngine", () => {
  it("places every node and keeps the requested sizes", async () => {
    const result = await new ElkLayoutEngine(new ELK()).layout(request);

    expect([...result.nodes.keys()].sort()).toEqual(["A", "B", "C"]);
    expect(result.nodes.get("A")).toMatchObject({ width: 80, height: 40 });
    expect(result.size.width).toBeGreaterThan(0);
    expect(result.size.height).toBeGreaterThan(0);
  });

  it("attaches edges to the requested ports", async () => {
    const result = await new ElkLayoutEngine(new ELK()).layout(request);
    const a = result.nodes.get("A");
    const c = result.nodes.get("C");
    const toB = result.edges.get("e0");
    const toC = result.edges.get("e1");

    expect(a && c && toB && toC).toBeTruthy();

    if (!a || !c || !toB || !toC) {
      return;
    }

    expect(toB[0]).toEqual({ x: a.x + 40, y: a.y + 40 });
    expect(toC[0]).toEqual({ x: a.x + 80, y: a.y + 20 });
    expect(toC.at(-1)).toEqual({ x: c.x + 40, y: c.y });
  });

  it("routes edges orthogonally", async () => {
    const result = await new ElkLayoutEngine(new ELK()).layout(request);

    for (const points of result.edges.values()) {
      points.slice(1).forEach((point, index) => {
        const previous = points[index];

        expect(previous).toBeDefined();

        if (!previous) {
          return;
        }

        expect(point.x === previous.x || point.y === previous.y).toBe(true);
      });
    }
  });

  it("keeps forward lines forward when a block is declared before the block that leads to it", async () => {
    const node = (id: string) => ({
      id,
      size: { width: 80, height: 40 },
      ports: allPorts(80, 40),
    });
    const edge = (id: string, from: string, to: string, back = false) => ({
      id,
      from,
      to,
      fromSide: back ? Side.Left : Side.Bottom,
      toSide: back ? Side.Left : Side.Top,
    });
    const result = await new ElkLayoutEngine(new ELK()).layout({
      ...request,
      // J is declared before I although I leads to J.
      nodes: ["A", "B", "J", "I"].map(node),
      edges: [
        edge("e0", "A", "B"),
        edge("e1", "B", "J"),
        edge("e2", "B", "I"),
        edge("e3", "I", "J"),
        edge("e4", "J", "A", true),
      ],
    });
    const i = result.nodes.get("I");
    const j = result.nodes.get("J");

    expect(i && j).toBeTruthy();
    expect(i?.y).toBeLessThan(j?.y ?? 0);
  });

  describe("frames", () => {
    const framed: LayoutRequest = {
      ...request,
      nodes: [
        { id: "A", size: { width: 80, height: 40 }, ports: allPorts(80, 40) },
        {
          id: "B",
          size: { width: 80, height: 40 },
          ports: allPorts(80, 40),
          group: "outer",
        },
        {
          id: "C",
          size: { width: 80, height: 40 },
          ports: allPorts(80, 40),
          group: "inner",
        },
        { id: "D", size: { width: 80, height: 40 }, ports: allPorts(80, 40) },
      ],
      edges: [
        {
          id: "e0",
          from: "A",
          to: "B",
          fromSide: Side.Bottom,
          toSide: Side.Top,
        },
        {
          id: "e1",
          from: "B",
          to: "C",
          fromSide: Side.Bottom,
          toSide: Side.Top,
        },
        {
          id: "e2",
          from: "C",
          to: "D",
          fromSide: Side.Bottom,
          toSide: Side.Top,
        },
      ],
      groups: [
        { id: "outer", padding: { top: 10, right: 10, bottom: 10, left: 10 } },
        {
          id: "inner",
          parent: "outer",
          padding: { top: 10, right: 10, bottom: 10, left: 10 },
        },
      ],
    };

    it("keeps members inside their frame and the rest outside", async () => {
      const result = await new ElkLayoutEngine(new ELK()).layout(framed);
      const outer = result.groups?.get("outer");
      const inner = result.groups?.get("inner");
      const at = (id: string) => result.nodes.get(id);

      expect(outer && inner).toBeTruthy();

      if (!outer || !inner) {
        return;
      }

      const inside = (frame: typeof outer, id: string): boolean => {
        const node = at(id);

        return (
          node !== undefined &&
          node.x >= frame.x &&
          node.y >= frame.y &&
          node.x + node.width <= frame.x + frame.width &&
          node.y + node.height <= frame.y + frame.height
        );
      };

      expect(inside(outer, "B")).toBe(true);
      expect(inside(outer, "C")).toBe(true);
      expect(inside(inner, "C")).toBe(true);
      expect(inside(inner, "B")).toBe(false);
      expect(inside(outer, "A")).toBe(false);
      expect(inside(outer, "D")).toBe(false);
      expect(inner.x).toBeGreaterThanOrEqual(outer.x);
      expect(inner.y + inner.height).toBeLessThanOrEqual(
        outer.y + outer.height,
      );
    });

    it("reports edges in the coordinates of the whole drawing", async () => {
      const result = await new ElkLayoutEngine(new ELK()).layout(framed);
      const b = result.nodes.get("B");
      const c = result.nodes.get("C");
      const edge = result.edges.get("e1");

      expect(b && c && edge).toBeTruthy();

      if (!b || !c || !edge) {
        return;
      }

      expect(edge[0]).toEqual({ x: b.x + 40, y: b.y + 40 });
      expect(edge.at(-1)).toEqual({ x: c.x + 40, y: c.y });
    });

    it("reports no frames when none were asked for", async () => {
      const result = await new ElkLayoutEngine(new ELK()).layout(request);

      expect(result.groups?.size ?? 0).toBe(0);
    });
  });

  describe("when ELK fails", () => {
    const framed: LayoutRequest = {
      ...request,
      nodes: [
        {
          id: "A",
          size: { width: 80, height: 40 },
          ports: allPorts(80, 40),
          group: "g",
        },
        {
          id: "B",
          size: { width: 80, height: 40 },
          ports: allPorts(80, 40),
          group: "g",
        },
      ],
      edges: [
        {
          id: "e0",
          from: "A",
          to: "B",
          fromSide: Side.Bottom,
          toSide: Side.Top,
        },
      ],
      groups: [
        { id: "g", padding: { top: 10, right: 10, bottom: 10, left: 10 } },
      ],
    };

    /** Fails the way ELK does on some frames: unless the options are the safe ones. */
    function flaky(safe: (graph: ElkNode) => boolean): ElkApi {
      const real = new ELK();

      return {
        layout: async (graph: ElkNode) => {
          if (!safe(graph)) {
            throw new TypeError(
              "Cannot read properties of undefined (reading 'a')",
            );
          }

          return real.layout(graph);
        },
      } as unknown as ElkApi;
    }

    it("asks again without the model order", async () => {
      const result = await new ElkLayoutEngine(
        flaky(
          (graph) =>
            graph.layoutOptions?.["elk.layered.considerModelOrder.strategy"] ===
            undefined,
        ),
      ).layout(framed);

      expect(result.groups?.get("g")).toBeDefined();
    });

    it("draws the frames around their members when the hierarchy fails too", async () => {
      const result = await new ElkLayoutEngine(
        flaky(
          (graph) =>
            graph.layoutOptions?.["elk.hierarchyHandling"] === undefined &&
            graph.layoutOptions?.["elk.layered.considerModelOrder.strategy"] ===
              undefined,
        ),
      ).layout(framed);
      const frame = result.groups?.get("g");
      const a = result.nodes.get("A");
      const b = result.nodes.get("B");

      expect(frame && a && b).toBeTruthy();
      expect(frame?.x).toBe((a?.x ?? 0) - 10);
      expect((frame?.y ?? 0) + (frame?.height ?? 0)).toBe(
        (b?.y ?? 0) + (b?.height ?? 0) + 10,
      );
    });

    it("gives up with the error when nothing works", async () => {
      await expect(
        new ElkLayoutEngine(flaky(() => false)).layout(framed),
      ).rejects.toThrow(/reading 'a'/);
    });
  });
});
