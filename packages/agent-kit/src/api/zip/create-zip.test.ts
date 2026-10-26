import { describe, expect, it } from "vitest";

import { crc32, createZip } from "./create-zip";

interface Read {
  readonly path: string;
  readonly text: string;
  readonly crcOk: boolean;
}

function readZip(bytes: Uint8Array): readonly Read[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();
  const end = bytes.length - 22;

  expect(view.getUint32(end, true)).toBe(0x06054b50);

  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  const result: Read[] = [];

  for (let index = 0; index < count; index += 1) {
    expect(view.getUint32(at, true)).toBe(0x02014b50);

    const crc = view.getUint32(at + 16, true);
    const size = view.getUint32(at + 24, true);
    const nameLength = view.getUint16(at + 28, true);
    const offset = view.getUint32(at + 42, true);
    const path = decoder.decode(bytes.subarray(at + 46, at + 46 + nameLength));

    expect(view.getUint32(offset, true)).toBe(0x04034b50);

    const localName = view.getUint16(offset + 26, true);
    const localExtra = view.getUint16(offset + 28, true);
    const start = offset + 30 + localName + localExtra;
    const data = bytes.subarray(start, start + size);

    result.push({
      path,
      text: decoder.decode(data),
      crcOk: crc32(data) === crc,
    });

    at += 46 + nameLength;
  }

  return result;
}

describe("crc32", () => {
  it("matches the well-known check value", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });

  it("is zero for no bytes", () => {
    expect(crc32(new Uint8Array())).toBe(0);
  });
});

describe("createZip", () => {
  it("stores every file under its path with a valid checksum", () => {
    const zip = createZip([
      { path: "skill/SKILL.md", data: "# Skill\n" },
      { path: "skill/scripts/a.mjs", data: "export {};\n" },
      { path: "skill/Ünï.md", data: "Привіт" },
    ]);

    expect(readZip(zip)).toEqual([
      { path: "skill/SKILL.md", text: "# Skill\n", crcOk: true },
      { path: "skill/scripts/a.mjs", text: "export {};\n", crcOk: true },
      { path: "skill/Ünï.md", text: "Привіт", crcOk: true },
    ]);
  });

  it("gives the same bytes for the same files", () => {
    const files = [{ path: "a.txt", data: "x" }];

    expect(createZip(files)).toEqual(createZip(files));
  });

  it("makes an empty archive that is only the end record", () => {
    expect(createZip([])).toHaveLength(22);
  });
});
