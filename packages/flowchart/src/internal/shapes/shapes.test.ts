import { describe, expect, it } from "vitest";

import { type DiagramNode, NODE_KINDS, type Rect, Side } from "@rhumb/kernel";

import { DecisionShape } from "./DecisionShape";
import { IoShape } from "./IoShape";
import { ShapeFactory } from "./ShapeFactory";

const bounds: Rect = { x: 10, y: 20, width: 80, height: 40 };

function nodeOf(kind: DiagramNode["kind"]): DiagramNode {
  return { id: "n", kind, label: "text" };
}

describe("shapes", () => {
  it("creates a shape for every node kind", () => {
    const factory = new ShapeFactory();

    for (const kind of NODE_KINDS) {
      const shape = factory.create(nodeOf(kind));

      expect(shape.ports(bounds)).toHaveLength(4);
      expect(shape.draw(bounds).tag).toMatch(/^(rect|polygon|g|circle)$/);
    }
  });

  it("attaches decision lines to the rhombus vertices", () => {
    const shape = new DecisionShape(nodeOf("decision"));

    expect(shape.port(bounds, Side.Top).position).toEqual({ x: 50, y: 20 });
    expect(shape.port(bounds, Side.Right).position).toEqual({ x: 90, y: 40 });
    expect(shape.port(bounds, Side.Bottom).position).toEqual({ x: 50, y: 60 });
    expect(shape.port(bounds, Side.Left).position).toEqual({ x: 10, y: 40 });
    expect(shape.draw(bounds).attrs.points).toBe("50,20 90,40 50,60 10,40");
  });

  it("doubles the text box for a decision", () => {
    const shape = new DecisionShape(nodeOf("decision"));

    expect(shape.measure({ width: 10, height: 5 })).toEqual({
      width: 20,
      height: 10,
    });
  });

  it("keeps parallelogram ports on its slanted sides", () => {
    const shape = new IoShape(nodeOf("io"));

    expect(shape.port(bounds, Side.Left).position).toEqual({ x: 16, y: 40 });
    expect(shape.port(bounds, Side.Right).position).toEqual({ x: 84, y: 40 });
    expect(shape.port(bounds, Side.Top).position).toEqual({ x: 50, y: 20 });
  });

  it("reports a missing port by shape id", () => {
    const shape = new DecisionShape(nodeOf("decision"));
    const broken = Object.assign(shape, { ports: () => [] });

    expect(() => broken.port(bounds, Side.Top)).toThrow(/no top port/);
  });
});
