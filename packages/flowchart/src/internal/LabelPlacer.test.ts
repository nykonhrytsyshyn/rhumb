import { describe, expect, it } from "vitest";

import { LabelPlacer, type LabelSurroundings } from "./LabelPlacer";

const p = (x: number, y: number) => ({ x, y });
const placer = new LabelPlacer({
  padding: 4,
  stub: 6,
  jumpRadius: 3,
  arrowLength: 8,
});
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

  it("keeps a gap between the label and a line that joins this one", () => {
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

    // Label height 10 plus the padding of 4 on each side of the junction.
    expect(Math.abs((label?.cy ?? 100) - 100)).toBeGreaterThanOrEqual(9);
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

  it("fits a label on a short line that stops at the line it joins", () => {
    const short = [p(0, 0), p(-57, 0)];
    const trunk = [p(-57, 100), p(-57, -100)];
    const wide = { width: 40, height: 14 };
    const label = placer.placeBeside(
      { ...line(short), size: wide },
      around(short, {
        edges: new Map([
          ["e", short],
          ["trunk", trunk],
        ]),
      }),
    );

    expect((label?.cx ?? 0) - wide.width / 2).toBeGreaterThan(-57);
    expect((label?.cx ?? 0) + wide.width / 2).toBeLessThan(0);
  });

  it("lets a label on a very short line lean into the corner of the block it leaves", () => {
    const short = [p(0, 0), p(-24, 0)];
    const trunk = [p(-24, 100), p(-24, -100)];
    const wide = { width: 22, height: 14 };
    const label = placer.placeBeside(
      { ...line(short), size: wide },
      around(short, {
        edges: new Map([
          ["e", short],
          ["trunk", trunk],
        ]),
        nodes: new Map([["n", { x: 0, y: -60, width: 200, height: 120 }]]),
      }),
    );

    // Clear of the line it joins, with the room a padding of 4 asks for.
    expect((label?.cx ?? 0) - wide.width / 2).toBeGreaterThanOrEqual(-24 + 2);
  });

  it("falls back to the nearest stretch of the line when its start is cramped", () => {
    const path = [p(0, 0), p(-24, 0), p(-24, -100), p(100, -100)];
    const wide = { width: 40, height: 14 };
    const label = placer.placeBeside(
      { ...line(path), size: wide, fullPoints: path },
      around(path, {
        nodes: new Map([["n", { x: -10, y: -40, width: 60, height: 80 }]]),
        edges: new Map([
          ["e", path],
          ["trunk", [p(-24, 100), p(-24, -100)]],
        ]),
      }),
    );

    // Beside the vertical stretch, not out beside the last one.
    expect(label?.cy).toBeGreaterThan(-100);
    expect(label?.cy).toBeLessThan(0);
  });
});

describe("LabelPlacer.stretchFor", () => {
  it("asks for the length a label beside a short line is missing", () => {
    const short = [p(0, 0), p(0, 12)];
    const stretch = placer.stretchFor(line(short), false);

    // 10 high, 4 padding either side and an arrowhead of 8: 26 in all.
    expect(stretch).toEqual({ from: p(0, 0), to: p(0, 12), extra: 14 });
  });

  it("asks for nothing when the line is long enough", () => {
    expect(placer.stretchFor(line([p(0, 0), p(0, 80)]), false)).toBeUndefined();
  });

  it("measures the longest stretch for a label on the line", () => {
    const bent = [p(0, 0), p(0, 10), p(30, 10)];
    const stretch = placer.stretchFor(line(bent), true);

    expect(stretch?.from).toEqual(p(0, 10));
  });

  it("reports a crowded label", () => {
    const path = [p(0, 0), p(0, 40)];
    const label = { text: "Yes", cx: 0, cy: 20, size, inline: true };

    expect(placer.isCrowded(label, line(path), around(path))).toBe(false);
    expect(
      placer.isCrowded(label, line(path), around(path, { hops: [p(0, 20)] })),
    ).toBe(true);
  });
});
