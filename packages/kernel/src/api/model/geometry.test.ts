import { describe, expect, it } from "vitest";

import { roundTo, snapUp } from "./geometry";

describe("geometry helpers", () => {
  it("snaps up to the next multiple of the step", () => {
    expect(snapUp(21, 20)).toBe(40);
    expect(snapUp(40, 20)).toBe(40);
    expect(snapUp(40.0000000001, 20)).toBe(40);
  });

  it("leaves the value alone when the step is not positive", () => {
    expect(snapUp(13, 0)).toBe(13);
  });

  it("rounds to the requested precision", () => {
    expect(roundTo(1.23456)).toBe(1.23);
    expect(roundTo(1.23456, 3)).toBe(1.235);
  });
});
