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
});
