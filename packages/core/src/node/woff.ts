import { brotliDecompressSync, inflateSync } from "node:zlib";

import type { ResolvedFont } from "../fonts";

/**
 * Text is measured from `head`, `hhea`, `hmtx` and `cmap` only, so what this
 * returns is not a whole font: just those tables, in a plain sfnt wrapper that
 * the metrics reader understands.
 */
const NEEDED = ["cmap", "head", "hhea", "hmtx"] as const;

interface Table {
  readonly tag: string;
  readonly data: Uint8Array;
}

function tag(view: DataView, offset: number): string {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

function sfnt(tables: readonly Table[]): Uint8Array | undefined {
  const picked = NEEDED.map((name) => tables.find((t) => t.tag === name));

  if (picked.some((table) => table === undefined)) {
    return undefined;
  }

  const found = picked as readonly Table[];
  const header = 12 + found.length * 16;
  const total = found.reduce(
    (sum, table) => sum + ((table.data.length + 3) & ~3),
    header,
  );
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  let offset = header;

  view.setUint32(0, 0x00010000);
  view.setUint16(4, found.length);

  found.forEach((table, index) => {
    const record = 12 + index * 16;

    for (let i = 0; i < 4; i++) {
      out[record + i] = table.tag.charCodeAt(i);
    }

    view.setUint32(record + 8, offset);
    view.setUint32(record + 12, table.data.length);
    out.set(table.data, offset);
    offset += (table.data.length + 3) & ~3;
  });

  return out;
}

/** WOFF 1: every table is zlib-compressed on its own. */
function fromWoff(bytes: Uint8Array): Uint8Array | undefined {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = view.getUint16(12);
  const tables: Table[] = [];

  for (let index = 0; index < count; index++) {
    const entry = 44 + index * 20;
    const offset = view.getUint32(entry + 4);
    const stored = view.getUint32(entry + 8);
    const original = view.getUint32(entry + 12);
    const raw = bytes.subarray(offset, offset + stored);

    tables.push({
      tag: tag(view, entry),
      data: stored < original ? inflateSync(raw) : raw,
    });
  }

  return sfnt(tables);
}

/** The tags a WOFF 2 table directory can name by number, in order. */
const KNOWN_TAGS = [
  "cmap",
  "head",
  "hhea",
  "hmtx",
  "maxp",
  "name",
  "OS/2",
  "post",
  "cvt ",
  "fpgm",
  "glyf",
  "loca",
  "prep",
  "CFF ",
  "VORG",
  "EBDT",
  "EBLC",
  "gasp",
  "hdmx",
  "kern",
  "LTSH",
  "PCLT",
  "VDMX",
  "vhea",
  "vmtx",
  "BASE",
  "GDEF",
  "GPOS",
  "GSUB",
  "EBSC",
  "JSTF",
  "MATH",
  "CBDT",
  "CBLC",
  "COLR",
  "CPAL",
  "SVG ",
  "sbix",
  "acnt",
  "avar",
  "bdat",
  "bloc",
  "bsln",
  "cvar",
  "fdsc",
  "feat",
  "fmtx",
  "fvar",
  "gvar",
  "hsty",
  "just",
  "lcar",
  "mort",
  "morx",
  "opbd",
  "prop",
  "trak",
  "Zapf",
  "Silf",
  "Glat",
  "Gloc",
  "Feat",
  "Sill",
] as const;

/** WOFF 2: one Brotli stream holds all tables; some are stored transformed. */
function fromWoff2(bytes: Uint8Array): Uint8Array | undefined {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = view.getUint16(12);
  let cursor = 48;

  const base128 = (): number => {
    let value = 0;

    for (let i = 0; i < 5; i++) {
      const byte = view.getUint8(cursor++);

      value = value * 128 + (byte & 0x7f);

      if ((byte & 0x80) === 0) {
        return value;
      }
    }

    throw new Error("Bad UIntBase128");
  };

  const entries: { tag: string; transformed: boolean; length: number }[] = [];

  for (let index = 0; index < count; index++) {
    const flags = view.getUint8(cursor++);
    const known = flags & 0x3f;
    const name =
      known === 0x3f
        ? tag(view, (cursor += 4) - 4)
        : (KNOWN_TAGS[known] ?? "????");
    const version = flags >> 6;
    // glyf and loca are transformed unless the version says 3; others, when it is not 0
    const transformed =
      name === "glyf" || name === "loca" ? version !== 3 : version !== 0;
    const original = base128();
    const length = transformed ? base128() : original;

    entries.push({ tag: name, transformed, length });
  }

  const compressed = bytes.subarray(cursor, cursor + view.getUint32(20));
  const stream = brotliDecompressSync(compressed);
  const tables: Table[] = [];
  let position = 0;

  for (const entry of entries) {
    tables.push({
      tag: entry.tag,
      data: stream.subarray(position, position + entry.length),
    });
    position += entry.length;
  }

  const hhea = tables.find((table) => table.tag === "hhea");
  const hmtx = tables.find((table) => table.tag === "hmtx");
  const transformedHmtx = entries.find(
    (entry) => entry.tag === "hmtx",
  )?.transformed;

  if (hhea !== undefined && hmtx !== undefined && transformedHmtx === true) {
    // Transformed: a flags byte, then the advances; the side bearings may be left out
    const metrics = new DataView(
      hhea.data.buffer,
      hhea.data.byteOffset,
    ).getUint16(34);
    const source = new DataView(hmtx.data.buffer, hmtx.data.byteOffset);
    const rebuilt = new Uint8Array(metrics * 4);
    const out = new DataView(rebuilt.buffer);

    for (let glyph = 0; glyph < metrics; glyph++) {
      out.setUint16(glyph * 4, source.getUint16(1 + glyph * 2));
    }

    tables[tables.indexOf(hmtx)] = { tag: "hmtx", data: rebuilt };
  }

  return sfnt(tables);
}

/**
 * The bytes of the tables that text measuring needs, taken out of a WOFF or
 * WOFF2 file; undefined for any other format or a file that cannot be read.
 */
export function decodeWebFont(font: ResolvedFont): Uint8Array | undefined {
  try {
    if (font.format === "woff") {
      return fromWoff(font.bytes);
    }

    return font.format === "woff2" ? fromWoff2(font.bytes) : undefined;
  } catch {
    return undefined;
  }
}
