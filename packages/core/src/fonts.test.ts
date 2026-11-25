import { describe, expect, it } from "vitest";

import { ProfileRegistry } from "@rhumb/profiles";

import { detectFontFormat, fontsForProfile, resolveFont } from "./fonts";

const profile = ProfileRegistry.withBuiltins().get("gost-19.701-90");

function bytes(...values: readonly (number | string)[]): Uint8Array {
  return Uint8Array.from(
    values.flatMap((value) =>
      typeof value === "number"
        ? [value]
        : Array.from(value, (char) => char.charCodeAt(0)),
    ),
  );
}

describe("detectFontFormat", () => {
  it("tells the four formats by their first bytes", () => {
    expect(detectFontFormat(bytes("wOF2", 0))).toBe("woff2");
    expect(detectFontFormat(bytes("wOFF", 0))).toBe("woff");
    expect(detectFontFormat(bytes("OTTO", 0))).toBe("opentype");
    expect(detectFontFormat(bytes(0, 1, 0, 0, 9))).toBe("truetype");
    expect(detectFontFormat(bytes("true", 0))).toBe("truetype");
  });

  it("does not guess when the bytes are something else", () => {
    expect(detectFontFormat(bytes("<svg"))).toBeUndefined();
    expect(detectFontFormat(new Uint8Array())).toBeUndefined();
  });
});

describe("resolveFont", () => {
  it("reads the format from the file and defaults the weight", () => {
    const font = resolveFont({ family: "A", data: bytes("OTTO", 1) });

    expect(font).toMatchObject({ format: "opentype", weight: "400" });
  });

  it("decodes base64 data", () => {
    const font = resolveFont({ family: "A", data: btoa("wOF2....") });

    expect(font.format).toBe("woff2");
    expect([...font.bytes.slice(0, 4)]).toEqual([...bytes("wOF2")]);
  });

  it("asks for the format when the file does not say it", () => {
    expect(() => resolveFont({ family: "A", data: bytes("nope") })).toThrow(
      /"A"/,
    );
    expect(
      resolveFont({ family: "A", data: bytes("nope"), format: "woff" }).format,
    ).toBe("woff");
  });
});

describe("fontsForProfile", () => {
  const stack = profile.font.family;

  it("keeps only the fonts the profile's stack names, case-insensitively", () => {
    const [first] = stack.split(",");
    const named = first?.replace(/['"]/g, "").trim() ?? "";
    const matched = fontsForProfile(
      [
        { family: named.toUpperCase(), data: bytes("OTTO", 1) },
        { family: "Unrelated", data: bytes("OTTO", 2) },
      ],
      profile,
    );

    expect(matched.map((font) => font.family)).toEqual([named.toUpperCase()]);
  });

  it("takes the first of several files for one family", () => {
    const [first] = stack.split(",");
    const named = first?.replace(/['"]/g, "").trim() ?? "";
    const [one] = fontsForProfile(
      [
        { family: named, data: bytes("OTTO", 1) },
        { family: named, data: bytes("OTTO", 2) },
      ],
      profile,
    );

    expect(one?.bytes[4]).toBe(1);
  });
});
