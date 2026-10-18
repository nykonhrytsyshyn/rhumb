import { describe, expect, it } from "vitest";

import type { LayoutResult } from "@rhumb/kernel";

import { openGap } from "./LayoutGaps";

const rect = (x: number, y: number, width: number, height: number) => ({
  x,
  y,
  width,
  height,
});

function layout(): LayoutResult {
  return {
    nodes: new Map([
      ["a", rect(0, 0, 40, 20)],
      ["b", rect(0, 100, 40, 20)],
      ["side", rect(100, 0, 40, 60)],
    ]),
    edges: new Map([
      [
        "ab",
        [
          { x: 20, y: 20 },
          { x: 20, y: 100 },
        ],
      ],
      [
        "short",
        [
          { x: 120, y: 60 },
          { x: 120, y: 100 },
        ],
      ],
    ]),
    size: { width: 140, height: 120 },
  };
}

describe("openGap", () => {
  const stretch = { from: { x: 20, y: 20 }, to: { x: 20, y: 100 }, extra: 30 };

  it("lengthens the line and moves what lies beyond it", () => {
    const opened = openGap(layout(), stretch);

    expect(opened?.edges.get("ab")).toEqual([
      { x: 20, y: 20 },
      { x: 20, y: 130 },
    ]);
    expect(opened?.nodes.get("b")?.y).toBe(130);
    expect(opened?.nodes.get("a")?.y).toBe(0);
    expect(opened?.size.height).toBe(150);
  });

  it("cuts where no block reaches, not through a block next to the line", () => {
    const opened = openGap(layout(), stretch);

    // The block on the side ends at 60, so the cut is below it, between
    // 60 and 100, and the side block stays where it is.
    expect(opened?.nodes.get("side")?.y).toBe(0);
    expect(opened?.edges.get("short")?.at(-1)?.y).toBe(130);
  });

  it("gives up when blocks cover the whole stretch", () => {
    const covered = {
      ...layout(),
      nodes: new Map([["wall", rect(-10, 20, 200, 80)]]),
    };

    expect(openGap(covered, stretch)).toBeUndefined();
  });

  it("works across a horizontal line too", () => {
    const opened = openGap(
      {
        nodes: new Map([["r", rect(100, 0, 40, 20)]]),
        edges: new Map([
          [
            "h",
            [
              { x: 40, y: 10 },
              { x: 100, y: 10 },
            ],
          ],
        ]),
        size: { width: 140, height: 20 },
      },
      { from: { x: 40, y: 10 }, to: { x: 100, y: 10 }, extra: 12 },
    );

    expect(opened?.nodes.get("r")?.x).toBe(112);
    expect(opened?.size.width).toBe(152);
  });
});
