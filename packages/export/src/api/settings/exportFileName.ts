import type { ExportFormat, ExportSettings } from "./exportSettings";
import { toFileName } from "./toFileName";

const EXTENSIONS: Readonly<Record<ExportFormat, string>> = {
  png: "png",
  svg: "svg",
  jpeg: "jpg",
  webp: "webp",
};

export function exportExtension(format: ExportFormat): string {
  return EXTENSIONS[format];
}

/** File name for a download; the standard's id is used when none is typed. */
export function exportFileName(
  profileId: string,
  { fileName, format }: ExportSettings,
): string {
  return `${toFileName(fileName, profileId)}.${exportExtension(format)}`;
}
