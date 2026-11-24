/**
 * Advance widths read from a TrueType or OpenType (TTF / OTF) font file, which
 * is all that is needed to tell how wide a line of text is. Kerning and shaping
 * are not applied, so a result can be a percent or two off what a browser draws,
 * which is far closer than an average glyph width.
 */
export class FontMetrics {
  private readonly view: DataView;
  private readonly unitsPerEm: number;
  private readonly advances: readonly number[];
  private readonly cmap: Cmap;
  private readonly cache = new Map<number, number | undefined>();

  private constructor(
    view: DataView,
    unitsPerEm: number,
    advances: readonly number[],
    cmap: Cmap,
  ) {
    this.view = view;
    this.unitsPerEm = unitsPerEm;
    this.advances = advances;
    this.cmap = cmap;
  }

  /** @returns undefined when the bytes are not a font this can read. */
  public static parse(bytes: Uint8Array): FontMetrics | undefined {
    try {
      const parts = read(bytes);

      return parts === undefined
        ? undefined
        : new FontMetrics(
            parts.view,
            parts.unitsPerEm,
            parts.advances,
            parts.cmap,
          );
    } catch {
      return undefined;
    }
  }

  /** Width of a character in em, or undefined when the font has no glyph. */
  public advance(codePoint: number): number | undefined {
    if (this.cache.has(codePoint)) {
      return this.cache.get(codePoint);
    }

    const glyph = lookup(this.view, this.cmap, codePoint);
    const width =
      glyph === undefined || glyph === 0
        ? undefined
        : (this.advances[Math.min(glyph, this.advances.length - 1)] ?? 0) /
          this.unitsPerEm;

    this.cache.set(codePoint, width);

    return width;
  }
}

interface Cmap {
  readonly format: 4 | 12;
  readonly offset: number;
}

const SFNT_VERSIONS = new Set([0x00010000, 0x74727565, 0x4f54544f]);

interface Parts {
  readonly view: DataView;
  readonly unitsPerEm: number;
  readonly advances: readonly number[];
  readonly cmap: Cmap;
}

function read(bytes: Uint8Array): Parts | undefined {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (!SFNT_VERSIONS.has(view.getUint32(0))) {
    return undefined;
  }

  const tables = new Map<string, number>();
  const count = view.getUint16(4);

  for (let index = 0; index < count; index++) {
    const record = 12 + index * 16;
    const tag = String.fromCharCode(
      ...[0, 1, 2, 3].map((i) => view.getUint8(record + i)),
    );

    tables.set(tag, view.getUint32(record + 8));
  }

  const head = tables.get("head");
  const hhea = tables.get("hhea");
  const hmtx = tables.get("hmtx");
  const cmapTable = tables.get("cmap");

  if (
    head === undefined ||
    hhea === undefined ||
    hmtx === undefined ||
    cmapTable === undefined
  ) {
    return undefined;
  }

  const unitsPerEm = view.getUint16(head + 18);
  const metricCount = view.getUint16(hhea + 34);
  const cmap = chooseCmap(view, cmapTable);

  if (unitsPerEm === 0 || metricCount === 0 || cmap === undefined) {
    return undefined;
  }

  const advances = Array.from({ length: metricCount }, (_, glyph) =>
    view.getUint16(hmtx + glyph * 4),
  );

  return { view, unitsPerEm, advances, cmap };
}

/** The best Unicode subtable: full range (format 12) before BMP (format 4). */
function chooseCmap(view: DataView, table: number): Cmap | undefined {
  const count = view.getUint16(table + 2);
  let best: (Cmap & { readonly rank: number }) | undefined;

  for (let index = 0; index < count; index++) {
    const record = table + 4 + index * 8;
    const platform = view.getUint16(record);
    const encoding = view.getUint16(record + 2);
    const offset = table + view.getUint32(record + 4);
    const format = view.getUint16(offset);
    const unicode = platform === 0 || (platform === 3 && encoding <= 10);

    if (!unicode || (format !== 4 && format !== 12)) {
      continue;
    }

    const rank = format === 12 ? 2 : 1;

    if (best === undefined || rank > best.rank) {
      best = { format, offset, rank };
    }
  }

  return best === undefined
    ? undefined
    : { format: best.format, offset: best.offset };
}

function lookup(
  view: DataView,
  cmap: Cmap,
  codePoint: number,
): number | undefined {
  return cmap.format === 12
    ? lookup12(view, cmap.offset, codePoint)
    : lookup4(view, cmap.offset, codePoint);
}

function lookup12(
  view: DataView,
  offset: number,
  codePoint: number,
): number | undefined {
  const groups = view.getUint32(offset + 12);

  for (let index = 0; index < groups; index++) {
    const group = offset + 16 + index * 12;
    const start = view.getUint32(group);
    const end = view.getUint32(group + 4);

    if (codePoint >= start && codePoint <= end) {
      return view.getUint32(group + 8) + (codePoint - start);
    }
  }

  return undefined;
}

function lookup4(
  view: DataView,
  offset: number,
  codePoint: number,
): number | undefined {
  if (codePoint > 0xffff) {
    return undefined;
  }

  const segments = view.getUint16(offset + 6) / 2;
  const ends = offset + 14;
  const starts = ends + segments * 2 + 2;
  const deltas = starts + segments * 2;
  const ranges = deltas + segments * 2;

  for (let segment = 0; segment < segments; segment++) {
    if (codePoint > view.getUint16(ends + segment * 2)) {
      continue;
    }

    if (codePoint < view.getUint16(starts + segment * 2)) {
      return undefined;
    }

    const delta = view.getInt16(deltas + segment * 2);
    const rangeOffset = view.getUint16(ranges + segment * 2);

    if (rangeOffset === 0) {
      return (codePoint + delta) & 0xffff;
    }

    const address =
      ranges +
      segment * 2 +
      rangeOffset +
      (codePoint - view.getUint16(starts + segment * 2)) * 2;
    const glyph = view.getUint16(address);

    return glyph === 0 ? undefined : (glyph + delta) & 0xffff;
  }

  return undefined;
}
