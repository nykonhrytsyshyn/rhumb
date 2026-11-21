import { describe, expect, it } from "vitest";

import { normalizeHex } from "./normalizeHex";

describe("normalizeHex", () => {
  it("lowercases and prefixes full colours", () => {
    expect(normalizeHex("#AABBCC")).toBe("#aabbcc");
    expect(normalizeHex("aabbcc")).toBe("#aabbcc");
  });

  it("expands short colours", () => {
    expect(normalizeHex("#F0a")).toBe("#ff00aa");
  });

  it("ignores surrounding spaces", () => {
    expect(normalizeHex("  #123456 ")).toBe("#123456");
  });

  it("rejects anything that is not a colour", () => {
    expect(normalizeHex("")).toBeNull();
    expect(normalizeHex("#12")).toBeNull();
    expect(normalizeHex("#1234567")).toBeNull();
    expect(normalizeHex("red")).toBeNull();
    expect(normalizeHex("#12345g")).toBeNull();
  });
});
