import { describe, expect, it } from "vitest";

import { contrastColor } from "./contrastColor";

describe("contrastColor", () => {
  it("picks black on light colours and white on dark ones", () => {
    expect(contrastColor("#ffffff")).toBe("#000000");
    expect(contrastColor("#fbf7ec")).toBe("#000000");
    expect(contrastColor("#000000")).toBe("#ffffff");
    expect(contrastColor("#1e3a8a")).toBe("#ffffff");
  });

  it("falls back to white for values that are not colours", () => {
    expect(contrastColor("currentColor")).toBe("#ffffff");
  });
});
