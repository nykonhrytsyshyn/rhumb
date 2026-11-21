import { toFileName } from "@shared/lib/to-file-name";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatExportTimestamp(date: Date = new Date()): string {
  const year = String(date.getFullYear());
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `rhumb-${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

export function defaultExportName(
  diagramName: string | undefined,
  date: Date = new Date(),
): string {
  const trimmed = diagramName?.trim() ?? "";

  return trimmed === "" ? formatExportTimestamp(date) : toFileName(trimmed);
}
