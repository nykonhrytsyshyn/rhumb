import { describe, expect, it } from "vitest";

import { LabelPlacer, type LabelSurroundings } from "./LabelPlacer";

const p = (x: number, y: number) => ({ x, y });
const placer = new LabelPlacer({ padding: 4, stub: 6, jumpRadius: 3 });
const size = { width: 20, height: 10 };

function line(points: ReturnType<typeof p>[], arrow = true) {
  return { id: "e", points, arrow, text: "Yes", size };
}

function around(
  points: ReturnType<typeof p>[],
  extra: Partial<LabelSurroundings> = {},
): LabelSurroundings {
  return {
    nodes: new Map(),
    edges: new Map([["e", points]]),
    hops: [],
    placed: [],
    ...extra,
  };
}

describe("LabelPlacer.placeInline", () => {
  const straight = [p(0, 0), p(0, 200)];

  it("centres a label on a line that has nothing in the way", () => {
    const label = placer.placeInline(line(straight), around(straight));

    expect(label?.cx).toBe(0);
    expect(label?.cy).toBe(100);
  });

  it("slides the label off an arch where lines cross", () => {
    const label = placer.placeInline(
      line(straight),
      around(straight, { hops: [p(0, 100)] }),
    );

    expect(label).toBeDefined();
    expect(Math.abs((label?.cy ?? 100) - 100)).toBeGreaterThan(8);
  });

  it("slides the label off a line that joins this one", () => {
    const joining = [p(-80, 100), p(0, 100)];
    const label = placer.placeInline(
      line(straight),
      around(straight, {
        edges: new Map([
          ["e", straight],
          ["other", joining],
        ]),
      }),
    );

    expect(Math.abs((label?.cy ?? 100) - 100)).toBeGreaterThan(5);
  });

  it("keeps clear of the arrowhead", () => {
    const short = [p(0, 0), p(0, 40)];
    const label = placer.placeInline(line(short), around(short));

    expect((label?.cy ?? 99) + size.height / 2).toBeLessThanOrEqual(40 - 6);
  });
});

describe("LabelPlacer.placeBeside", () => {
  const down = [p(0, 0), p(0, 100)];

  it("prefers the side away from where the line turns", () => {
    const label = placer.placeBeside(
      line([p(0, 0), p(0, 50), p(40, 50)]),
      around([p(0, 0), p(0, 50), p(40, 50)]),
    );

    expect(label?.cx).toBeLessThan(0);
  });

  it("moves to the other side when a block is in the way", () => {
    const label = placer.placeBeside(
      line(down),
      around(down, {
        nodes: new Map([["n", { x: -60, y: -5, width: 55, height: 40 }]]),
      }),
    );

    expect(label?.cx).toBeGreaterThan(0);
  });

  it("moves down the line when both sides are taken", () => {
    const label = placer.placeBeside(
      line(down),
      around(down, {
        nodes: new Map([["n", { x: -60, y: -5, width: 55, height: 20 }]]),
        placed: [{ text: "x", cx: 14, cy: 9, size, inline: false }],
      }),
    );

    expect(label?.cy).toBeGreaterThan(15);
  });
});
