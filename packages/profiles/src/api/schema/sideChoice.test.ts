import { describe, expect, it } from "vitest";

import { allowedSides, canUseDistinctSides } from "./sideChoice";

describe("allowedSides", () => {
  it("lists the pair an open choice may settle on", () => {
    expect(allowedSides("side")).toEqual(["left", "right"]);
    expect(allowedSides("vertical")).toEqual(["top", "bottom"]);
  });

  it("keeps a particular side as it is", () => {
    expect(allowedSides("bottom")).toEqual(["bottom"]);
  });
});

describe("canUseDistinctSides", () => {
  it("accepts particular sides that differ", () => {
    expect(canUseDistinctSides(["top", "left", "right"])).toBe(true);
  });

  it("rejects particular sides that clash", () => {
    expect(canUseDistinctSides(["top", "left", "left"])).toBe(false);
  });

  it("lets two open side choices share the left and the right", () => {
    expect(canUseDistinctSides(["top", "side", "side"])).toBe(true);
  });

  it("rejects three roles that all need a left or right side", () => {
    expect(canUseDistinctSides(["side", "side", "side"])).toBe(false);
  });

  it("rejects an open choice whose pair is already taken", () => {
    expect(canUseDistinctSides(["left", "right", "side"])).toBe(false);
  });

  it("finds a way around a particular side taken from a pair", () => {
    expect(canUseDistinctSides(["side", "left", "vertical"])).toBe(true);
  });
});
