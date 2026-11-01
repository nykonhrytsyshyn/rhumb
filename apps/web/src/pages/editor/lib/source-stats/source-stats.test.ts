import { describe, expect, it } from "vitest";

import { sourceStats } from "./source-stats";

describe("sourceStats", () => {
  it("counts the lines and the characters", () => {
    expect(sourceStats("flowchart TD\nA --> B")).toEqual({
      lines: 2,
      characters: 20,
    });
  });

  it("counts every kind of line break once", () => {
    expect(sourceStats("a\r\nb\rc\nd").lines).toBe(4);
  });

  it("gives blank text no lines", () => {
    expect(sourceStats("  \n ")).toEqual({ lines: 0, characters: 4 });
    expect(sourceStats("")).toEqual({ lines: 0, characters: 0 });
  });
});
