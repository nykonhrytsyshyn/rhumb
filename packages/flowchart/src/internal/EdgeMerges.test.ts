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
    const joined = joinMergingLines([main, { ...side, arrow: false }], 5);

    expect(joined.has("side")).toBe(false);
  });

  it("keeps the whole line when the run before the join is too short", () => {
    expect(joinMergingLines([main, side], 200).size).toBe(0);
  });

  it("brings a line that runs a hair apart onto the track of the other one", () => {
    const first = {
      id: "first",
      to: "T",
      arrow: true,
      points: [p(70, 256), p(35, 256), p(35, 15), p(185, 15)],
    };
    const second = {
      id: "second",
      to: "T",
      arrow: true,
      points: [
        p(300, 503),
        p(18, 503),
        p(18, 135),
        p(35, 135),
        p(35, 15),
        p(185, 15),
      ],
    };
    const joined = joinMergingLines([first, second], 5, 20);

    expect(joined.get("second")).toEqual([
      p(300, 503),
      p(35, 503),
      p(35, 15),
      p(185, 15),
    ]);
    expect(joined.get("first")).toEqual([p(70, 256), p(35, 256)]);
  });

  it("does not move a line that is farther away than the reach", () => {
    const joined = joinMergingLines(
      [
        {
          id: "a",
          to: "T",
          arrow: true,
          points: [p(0, 0), p(0, 100), p(50, 100)],
        },
        {
          id: "b",
          to: "T",
          arrow: true,
          points: [p(80, 0), p(80, 50), p(20, 50), p(20, 100), p(50, 100)],
        },
      ],
      5,
      10,
    );

    expect(joined.get("b")?.some((point) => point.x === 0)).toBeFalsy();
  });
});
