import { describe, expect, it } from "vitest";

import { toFileName } from "./file-name";

describe("toFileName", () => {
  it("keeps an ordinary name", () => {
    expect(toFileName("Online store")).toBe("Online store");
    expect(toFileName("Схема алгоритму")).toBe("Схема алгоритму");
  });

  it("replaces characters that files cannot contain", () => {
    expect(toFileName('a/b\\c:d*e?f"g<h>i|j')).toBe("a-b-c-d-e-f-g-h-i-j");
  });

  it("collapses whitespace and leading dots", () => {
    expect(toFileName("  many   spaces  ")).toBe("many spaces");
    expect(toFileName("..hidden")).toBe("hidden");
  });

  it("falls back for an empty name and shortens long ones", () => {
    expect(toFileName("   ")).toBe("diagram");
    expect(toFileName("", "scheme")).toBe("scheme");
    expect(toFileName("x".repeat(200))).toHaveLength(80);
  });
});
