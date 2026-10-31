export const LAYER_WEIGHTS = {
  app: 0,
  pages: 1,
  widgets: 2,
  features: 3,
  entities: 4,
  shared: 5,
} as const;

export type Layer = keyof typeof LAYER_WEIGHTS;

export const LAYERS: ReadonlyMap<string, Layer> = new Map(
  (Object.keys(LAYER_WEIGHTS) as Layer[]).map((layer) => [layer, layer]),
);

export const CROSS_SLICE_EXEMPT_LAYERS: ReadonlySet<Layer> = new Set([
  "shared",
  "app",
]);

export const PUBLIC_API_INDEX_ENTRY_LAYERS: ReadonlySet<Layer> = new Set([
  "app",
  "shared",
]);

export const INDEX_PATTERN = /^(index|server)(\.(ts|tsx|js|jsx))?$/;

export const RESOLVABLE_INDEX_FILES: readonly string[] = [
  "index.ts",
  "index.tsx",
  "index.js",
  "index.jsx",
  "server.ts",
  "server.tsx",
];

const FILE_PATTERN =
  /src\/(app|pages|widgets|features|entities|shared)(?:\/([^/]+))?/;

export interface FileLocation {
  readonly layer: Layer | undefined;
  readonly slice: string | undefined;
}

export function locateFile(filename: string): FileLocation {
  const match = FILE_PATTERN.exec(
    filename.includes("\\") ? filename.replace(/\\/g, "/") : filename,
  );

  return { layer: match?.[1] as Layer | undefined, slice: match?.[2] };
}

export interface ParsedImport {
  readonly layer: Layer;
  readonly slice: string;
  readonly internalPath: string | undefined;
}

export function parseImport(specifier: string): ParsedImport | null {
  if (specifier.charCodeAt(0) !== 64 /* @ */) {
    return null;
  }

  const layerEnd = specifier.indexOf("/");

  if (layerEnd < 2) {
    return null;
  }

  const layer = LAYERS.get(specifier.slice(1, layerEnd));

  if (!layer) {
    return null;
  }

  const sliceEnd = specifier.indexOf("/", layerEnd + 1);
  const slice = specifier.slice(
    layerEnd + 1,
    sliceEnd === -1 ? undefined : sliceEnd,
  );

  if (!slice) {
    return null;
  }

  const internalPath = sliceEnd === -1 ? "" : specifier.slice(sliceEnd + 1);

  return { layer, slice, internalPath: internalPath || undefined };
}
