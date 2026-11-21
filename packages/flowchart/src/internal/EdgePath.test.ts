import { describe, expect, it } from "vitest";

import { buildEdgePath } from "./EdgePath";

describe("buildEdgePath", () => {
  it("draws plain polylines as straight commands", () => {
    expect(
      buildEdgePath(
        [
          { x: 0, y: 0 },
          { x: 0, y: 10 },
          { x: 20, y: 10 },
        ],
        [],
        2,
      ),
    ).toBe("M0,0 L0,10 L20,10");
  });

  it("arches over a crossing, upwards when going right", () => {
    const path = buildEdgePath(
      [
        { x: 0, y: 10 },
        { x: 40, y: 10 },
      ],
      [{ segment: 0, at: { x: 20, y: 10 } }],
      2,
    );
    expect(path).toBe("M0,10 L18,10 A2,2 0 0 1 22,10 L40,10");
  });

  it("arches upwards when going left too", () => {
    const path = buildEdgePath(
      [
        { x: 40, y: 10 },
        { x: 0, y: 10 },
      ],
      [{ segment: 0, at: { x: 20, y: 10 } }],
      2,
    );
    expect(path).toBe("M40,10 L22,10 A2,2 0 0 0 18,10 L0,10");
  });

  it("orders several arches along the direction of travel", () => {
    const path = buildEdgePath(
      [
        { x: 40, y: 0 },
        { x: 0, y: 0 },
      ],
      [
        { segment: 0, at: { x: 10, y: 0 } },
        { segment: 0, at: { x: 30, y: 0 } },
      ],
      1,
    );
    expect(path.indexOf("L31")).toBeLessThan(path.indexOf("L11"));
  });

  it("cuts a gap out of a line", () => {
    const path = buildEdgePath(
      [
        { x: 0, y: 0 },
        { x: 0, y: 40 },
      ],
      [],
      2,
      [{ x: 0, y: 20, reach: 5 }],
    );

    expect(path).toBe("M0,0 L0,15 M0,25 L0,40");
  });

  it("keeps the corners on both sides of a gap", () => {
    const path = buildEdgePath(
      [
        { x: 0, y: 0 },
        { x: 0, y: 20 },
        { x: 40, y: 20 },
      ],
      [],
      2,
      [{ x: 20, y: 20, reach: 4 }],
    );

    expect(path).toBe("M0,0 L0,20 L16,20 M24,20 L40,20");
  });

  it("returns an empty path without points", () => {
    expect(buildEdgePath([], [], 2)).toBe("");
  });
});
