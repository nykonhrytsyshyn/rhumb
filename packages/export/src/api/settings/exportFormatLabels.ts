import type { ExportFormat } from "./exportSettings";

/** Names of the formats as people know them; they are not translated. */
export const EXPORT_FORMAT_LABELS: Readonly<Record<ExportFormat, string>> = {
  png: "PNG",
  svg: "SVG",
  jpeg: "JPEG",
  webp: "WebP",
};
