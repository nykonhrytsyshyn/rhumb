import { describe, expect, it } from "vitest";

import { type DiagramNode, NODE_KINDS, type Rect, Side } from "@rhumb/kernel";

import { DecisionShape } from "./DecisionShape";
import { IoShape } from "./IoShape";
import { ParallelShape } from "./ParallelShape";
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
      expect(shape.draw(bounds).tag).toMatch(
        /^(rect|polygon|polyline|path|g|circle)$/,
      );
    }
  });

  it("keeps the ports and the text of every block inside its bounds", () => {
    const factory = new ShapeFactory();

    for (const kind of NODE_KINDS) {
      const shape = factory.create(nodeOf(kind));
      const centre = shape.labelCenter(bounds);

      for (const { position } of shape.ports(bounds)) {
        expect(position.x, kind).toBeGreaterThanOrEqual(bounds.x);
        expect(position.x, kind).toBeLessThanOrEqual(bounds.x + bounds.width);
        expect(position.y, kind).toBeGreaterThanOrEqual(bounds.y);
        expect(position.y, kind).toBeLessThanOrEqual(bounds.y + bounds.height);
      }

      expect(centre.x, kind).toBeGreaterThan(bounds.x);
      expect(centre.x, kind).toBeLessThan(bounds.x + bounds.width);
      expect(centre.y, kind).toBeGreaterThan(bounds.y);
      expect(centre.y, kind).toBeLessThan(bounds.y + bounds.height);
    }
  });

  it("gives every block with text room for it", () => {
    const factory = new ShapeFactory();
    const text = { width: 40, height: 12 };

    for (const kind of NODE_KINDS) {
      const shape = factory.create(nodeOf(kind));

      if (!shape.showsText) {
        continue;
      }

      const size = shape.measure(text);

      expect(size.width, kind).toBeGreaterThanOrEqual(text.width);
      expect(size.height, kind).toBeGreaterThanOrEqual(text.height);
    }
  });

  it("sizes a transfer for the way it points", () => {
    const factory = new ShapeFactory();
    const down = factory.create(nodeOf("transfer"));
    const across = factory.create(nodeOf("transfer"));
    const text = { width: 20, height: 12 };

    across.alongFlow("LR");

    expect(down.measure(text).width).toBeGreaterThan(
      down.measure(text).height * 0.5,
    );
    expect(across.measure(text)).not.toEqual(down.measure(text));
  });

  it("draws a transfer as an equilateral triangle, whichever way it points", () => {
    const factory = new ShapeFactory();

    for (const direction of ["TB", "BT", "LR", "RL"] as const) {
      const shape = factory.create(nodeOf("transfer"));

      shape.alongFlow(direction);

      const size = shape.measure({ width: 14, height: 14 });
      const drawn = shape.draw({ x: 0, y: 0, ...size });
      const corners = String(drawn.attrs.points)
        .split(" ")
        .map((pair) => pair.split(",").map(Number));
      const side = (a: number, b: number): number =>
        Math.hypot(
          (corners[a]?.[0] ?? 0) - (corners[b]?.[0] ?? 0),
          (corners[a]?.[1] ?? 0) - (corners[b]?.[1] ?? 0),
        );

      expect(side(0, 1), direction).toBeCloseTo(side(1, 2), 1);
      expect(side(1, 2), direction).toBeCloseTo(side(2, 0), 1);
    }
  });

  it("lets lines meet the circle of a tape at its vertices", () => {
    const shape = new ShapeFactory().create(nodeOf("sequentialStorage"));
    const box = { x: 0, y: 0, width: 125, height: 100 };
    const [top, , bottom] = shape.ports(box);

    expect(top?.position.y).toBe(0);
    expect(bottom?.position.y).toBe(100);
  });

  it("keeps the text of a comment as close to its bracket on every side", () => {
    const shape = new ShapeFactory().create(nodeOf("comment"));
    const text = { width: 40, height: 20 };

    expect(shape.compact).toBe(true);
    expect(shape.measure(text)).toEqual(text);
  });

  it("puts the lines of a bar of parallel actions the gauged distance apart", () => {
    const shape = new ShapeFactory().create(nodeOf("parallel"));

    if (!(shape instanceof ParallelShape)) {
      throw new TypeError("Expected a parallel shape");
    }

    shape.gauge(8, 4);

    const [first, second] = shape.pair({ x: 0, y: 0, width: 100, height: 16 });

    expect(shape.thickness).toBe(16);
    expect(second - first).toBe(8);
    expect(first).toBe(4);
  });

  it("stands a bar on its end in a diagram that flows sideways", () => {
    const bar = new ShapeFactory().create(nodeOf("parallel"));

    expect(bar.turned).toBe(false);
    bar.alongFlow("LR");
    expect(bar.turned).toBe(true);
  });

  it("draws no text in the bar that stands for parallel work", () => {
    const factory = new ShapeFactory();

    expect(factory.create(nodeOf("parallel")).showsText).toBe(false);
    expect(factory.create(nodeOf("process")).showsText).toBe(true);
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

  it("offers more places to tie a note than the port of a rhombus", () => {
    const shape = new DecisionShape(nodeOf("decision"));
    const points = shape.notePoints(bounds, Side.Right);

    expect(points).toEqual([
      { x: 90, y: 40 },
      { x: 70, y: 30 },
      { x: 70, y: 50 },
    ]);
    expect(
      new ShapeFactory()
        .create(nodeOf("sequentialStorage"))
        .notePoints(bounds, Side.Right),
    ).toHaveLength(1);
  });

  it("reports a missing port by shape id", () => {
    const shape = new DecisionShape(nodeOf("decision"));
    const broken = Object.assign(shape, { ports: () => [] });

    expect(() => broken.port(bounds, Side.Top)).toThrow(/no top port/);
  });
});
