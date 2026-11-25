import { describe, expect, it } from "vitest";

import { toBase64 } from "./toBase64";

describe("toBase64", () => {
  it("encodes bytes", () => {
    expect(toBase64(new Uint8Array([65, 66, 67]))).toBe("QUJD");
    expect(toBase64(new Uint8Array())).toBe("");
  });

  it("round-trips a file larger than one chunk", () => {
    const bytes = Uint8Array.from({ length: 100_003 }, (_, i) => (i * 7) % 256);

    const decoded = Uint8Array.from(atob(toBase64(bytes)), (char) =>
      char.charCodeAt(0),
    );

    expect(decoded).toEqual(bytes);
  });
});
