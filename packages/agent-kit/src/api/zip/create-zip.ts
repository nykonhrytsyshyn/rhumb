export interface ZipEntry {
  readonly path: string;
  readonly data: string | Uint8Array;
}

const ENCODER = new TextEncoder();

/** 1980-01-01 00:00: the earliest date a zip can hold, so builds repeat. */
const DOS_TIME = 0x0000;
const DOS_DATE = 0x0021;

/** Marks names as UTF-8. */
const FLAG_UTF8 = 0x0800;
/** Unix host (3), zip version 3.0 (30). */
const VERSION_MADE_BY = (3 << 8) | 30;
const VERSION_NEEDED = 20;
const FILE_MODE = (0o100644 << 16) >>> 0;

let crcTable: Uint32Array | undefined;

function table(): Uint32Array {
  if (crcTable === undefined) {
    const made = new Uint32Array(256);

    for (let index = 0; index < 256; index += 1) {
      let value = index;

      for (let bit = 0; bit < 8; bit += 1) {
        value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }

      made[index] = value >>> 0;
    }

    crcTable = made;
  }

  return crcTable;
}

export function crc32(bytes: Uint8Array): number {
  const lookup = table();
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = (lookup[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

interface Prepared {
  readonly name: Uint8Array;
  readonly data: Uint8Array;
  readonly crc: number;
  readonly offset: number;
}

function writer(): {
  readonly u16: (value: number) => void;
  readonly u32: (value: number) => void;
  readonly bytes: (value: Uint8Array) => void;
  readonly size: () => number;
  readonly finish: () => Uint8Array;
} {
  const chunks: Uint8Array[] = [];
  let length = 0;

  const push = (chunk: Uint8Array): void => {
    chunks.push(chunk);
    length += chunk.length;
  };

  return {
    u16: (value) => {
      const chunk = new Uint8Array(2);
      new DataView(chunk.buffer).setUint16(0, value, true);
      push(chunk);
    },
    u32: (value) => {
      const chunk = new Uint8Array(4);
      new DataView(chunk.buffer).setUint32(0, value >>> 0, true);
      push(chunk);
    },
    bytes: push,
    size: () => length,
    finish: () => {
      const result = new Uint8Array(length);
      let at = 0;

      for (const chunk of chunks) {
        result.set(chunk, at);
        at += chunk.length;
      }

      return result;
    },
  };
}

export function createZip(entries: readonly ZipEntry[]): Uint8Array {
  const out = writer();
  const prepared: Prepared[] = [];

  for (const entry of entries) {
    const data =
      typeof entry.data === "string" ? ENCODER.encode(entry.data) : entry.data;
    const name = ENCODER.encode(entry.path);
    const crc = crc32(data);
    const offset = out.size();

    out.u32(0x04034b50);
    out.u16(VERSION_NEEDED);
    out.u16(FLAG_UTF8);
    out.u16(0);
    out.u16(DOS_TIME);
    out.u16(DOS_DATE);
    out.u32(crc);
    out.u32(data.length);
    out.u32(data.length);
    out.u16(name.length);
    out.u16(0);
    out.bytes(name);
    out.bytes(data);

    prepared.push({ name, data, crc, offset });
  }

  const directoryStart = out.size();

  for (const file of prepared) {
    out.u32(0x02014b50);
    out.u16(VERSION_MADE_BY);
    out.u16(VERSION_NEEDED);
    out.u16(FLAG_UTF8);
    out.u16(0);
    out.u16(DOS_TIME);
    out.u16(DOS_DATE);
    out.u32(file.crc);
    out.u32(file.data.length);
    out.u32(file.data.length);
    out.u16(file.name.length);
    out.u16(0);
    out.u16(0);
    out.u16(0);
    out.u16(0);
    out.u32(FILE_MODE);
    out.u32(file.offset);
    out.bytes(file.name);
  }

  const directorySize = out.size() - directoryStart;

  out.u32(0x06054b50);
  out.u16(0);
  out.u16(0);
  out.u16(prepared.length);
  out.u16(prepared.length);
  out.u32(directorySize);
  out.u32(directoryStart);
  out.u16(0);

  return out.finish();
}
