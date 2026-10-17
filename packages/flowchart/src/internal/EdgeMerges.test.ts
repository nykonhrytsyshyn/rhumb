import { describe, expect, it } from "vitest";

import { joinMergingLines } from "./EdgeMerges";

const p = (x: number, y: number) => ({ x, y });

describe("joinMergingLines", () => {
  const main = {
    id: "main",
    to: "T",
    arrow: true,
    points: [p(0, 0), p(0, 100)],
  };
  const side = {
    id: "side",
    to: "T",
    arrow: true,
    points: [p(100, 40), p(0, 40), p(0, 100)],
  };

  it("stops a line where it first touches the straighter one", () => {
    const joined = joinMergingLines([main, side], 5);

    expect(joined.get("side")).toEqual([p(100, 40), p(0, 40)]);
    expect(joined.has("main")).toBe(false);
  });

  it("leaves lines to different blocks alone", () => {
    expect(joinMergingLines([main, { ...side, to: "U" }], 5).size).toBe(0);
  });

  it("leaves a line without an arrowhead whole", () => {
    expect(joinMergingLines([main, { ...side, arrow: false }], 5).size).toBe(0);
  });

  it("keeps the whole line when the run before the join is too short", () => {
    expect(joinMergingLines([main, side], 200).size).toBe(0);
  });
});
