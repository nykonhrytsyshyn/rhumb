import { describe, expect, it } from "vitest";

import { fontFamilies } from "./font-families";

describe("fontFamilies", () => {
  it("lists the fonts of a stack in order, without quotes", () => {
    expect(
      fontFamilies("'OpenGost Type A', \"GOST type A\", Arial, sans-serif"),
    ).toEqual(["OpenGost Type A", "GOST type A", "Arial", "sans-serif"]);
  });

  it("keeps a comma that is inside quotes", () => {
    expect(fontFamilies("'Odd, name', serif")).toEqual(["Odd, name", "serif"]);
  });

  it("skips empty entries", () => {
    expect(fontFamilies(" , Arial ,, ")).toEqual(["Arial"]);
    expect(fontFamilies("")).toEqual([]);
  });
});
