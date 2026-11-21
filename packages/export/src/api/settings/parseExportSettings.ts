import { DEFAULT_EXPORT_SETTINGS } from "./defaultExportSettings";
import {
  EXPORT_FORMATS,
  EXPORT_SCALES,
  type ExportFormat,
  type ExportRange,
  type ExportScale,
  type ExportSettings,
  PADDING_RANGE,
  QUALITY_RANGE,
  RADIUS_RANGE,
} from "./exportSettings";
import { normalizeHex } from "./normalizeHex";

const MAX_FILE_NAME = 80;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pick<T>(options: readonly T[], value: unknown, fallback: T): T {
  return options.find((option) => option === value) ?? fallback;
}

function color(value: unknown, fallback: string): string {
  return typeof value === "string"
    ? (normalizeHex(value) ?? fallback)
    : fallback;
}

function flag(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function ranged(value: unknown, range: ExportRange, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(range.max, Math.max(range.min, Math.round(value)))
    : fallback;
}

/**
 * Restores saved settings. Anything missing, outdated or tampered with falls
 * back to its default on its own, so one bad field never loses the rest.
 */
export function parseExportSettings(raw: string): ExportSettings {
  const defaults = DEFAULT_EXPORT_SETTINGS;
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return defaults;
  }

  if (!isRecord(parsed)) {
    return defaults;
  }

  return {
    format: pick<ExportFormat>(EXPORT_FORMATS, parsed.format, defaults.format),
    scale: pick<ExportScale>(EXPORT_SCALES, parsed.scale, defaults.scale),
    quality: ranged(parsed.quality, QUALITY_RANGE, defaults.quality),
    ink: color(parsed.ink, defaults.ink),
    fill: color(parsed.fill, defaults.fill),
    hollow: flag(parsed.hollow, defaults.hollow),
    background: color(parsed.background, defaults.background),
    transparent: flag(parsed.transparent, defaults.transparent),
    padding: ranged(parsed.padding, PADDING_RANGE, defaults.padding),
    radius: ranged(parsed.radius, RADIUS_RANGE, defaults.radius),
    fileName:
      typeof parsed.fileName === "string"
        ? parsed.fileName.slice(0, MAX_FILE_NAME)
        : defaults.fileName,
  };
}
