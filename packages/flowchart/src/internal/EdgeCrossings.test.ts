import { describe, expect, it } from "vitest";

import { CrossingFinder, type RoutedEdge } from "./EdgeCrossings";

function edge(
  id: string,
  from: string,
  to: string,
  ...coordinates: [number, number][]
): RoutedEdge {
  return {
    id,
    from,
    to,
    points: coordinates.map(([x, y]) => ({ x, y })),
  };
}

const finder = new CrossingFinder(5);

describe("CrossingFinder", () => {
  it("makes the horizontal line hop over a vertical one", () => {
    const horizontal = edge("h", "a", "b", [0, 50], [100, 50]);
    const vertical = edge("v", "c", "d", [40, 0], [40, 100]);
    const hops = finder.find([horizontal, vertical]);
    expect(hops.get("h")).toEqual([{ segment: 0, at: { x: 40, y: 50 } }]);
    expect(hops.get("v")).toBeUndefined();
  });

  it("finds the same crossing whichever line comes first", () => {
    const horizontal = edge("h", "a", "b", [0, 50], [100, 50]);
    const vertical = edge("v", "c", "d", [40, 0], [40, 100]);
    expect(finder.find([vertical, horizontal]).get("h")).toHaveLength(1);
  });

  it("hops even when the lines belong to the same pair of blocks", () => {
    const forward = edge("f", "a", "b", [40, 0], [40, 100]);
    const backward = edge("b", "b", "a", [100, 50], [0, 50]);
    expect(finder.find([forward, backward]).get("b")).toHaveLength(1);
  });

  it("does not hop lines that merely start from the same point", () => {
    const left = edge("l", "a", "b", [40, 0], [40, 50], [0, 50]);
    const right = edge("r", "a", "c", [40, 0], [40, 50], [100, 50]);
    expect(finder.find([left, right]).size).toBe(0);
  });

  it("ignores junctions where a line ends on another", () => {
    const horizontal = edge("h", "a", "b", [0, 50], [100, 50]);
    const vertical = edge("v", "c", "d", [40, 0], [40, 50]);
    expect(finder.find([horizontal, vertical]).size).toBe(0);
  });

  it("skips crossings too close to a corner for an arch", () => {
    const horizontal = edge("h", "a", "b", [0, 50], [100, 50]);
    const vertical = edge("v", "c", "d", [97, 0], [97, 100]);
    expect(finder.find([horizontal, vertical]).size).toBe(0);
  });

  it("ignores parallel and collinear lines", () => {
    const one = edge("a", "a", "b", [0, 50], [100, 50]);
    const two = edge("b", "c", "d", [20, 50], [80, 50]);
    expect(finder.find([one, two]).size).toBe(0);
  });

  it("keeps hops apart and ordered along the line", () => {
    const horizontal = edge("h", "a", "b", [0, 50], [200, 50]);
    const near = edge("n", "c", "d", [60, 0], [60, 100]);
    const tooNear = edge("t", "e", "f", [64, 0], [64, 100]);
    const far = edge("f", "g", "i", [20, 0], [20, 100]);
    const hops = finder.find([horizontal, near, tooNear, far]);
    expect(hops.get("h")?.map((hop) => hop.at.x)).toEqual([20, 60]);
  });
});
