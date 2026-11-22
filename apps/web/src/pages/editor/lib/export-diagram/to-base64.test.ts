import { describe, expect, it } from "vitest";

import { toBase64 } from "./to-base64";

describe("toBase64", () => {
  it("encodes bytes", () => {
    expect(toBase64(new Uint8Array([65, 66, 67]))).toBe("QUJD");
    expect(toBase64(new Uint8Array())).toBe("");
  });

  it("matches Node for a file larger than one chunk", () => {
    const bytes = Uint8Array.from({ length: 100_003 }, (_, i) => (i * 7) % 256);

    expect(toBase64(bytes)).toBe(Buffer.from(bytes).toString("base64"));
  });
});
