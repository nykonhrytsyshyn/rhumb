import { DEFAULT_EXPORT_SETTINGS } from "./defaultExportSettings";
import { ExportOptionError } from "./exportOptionError";
import {
  EXPORT_PRESETS,
  EXPORT_PRESET_IDS,
  type ExportPresetId,
} from "./exportPresets";
import {
  EXPORT_FORMATS,
  EXPORT_SCALES,
  type ExportRange,
  type ExportSettings,
  PADDING_RANGE,
  QUALITY_RANGE,
  RADIUS_RANGE,
} from "./exportSettings";

/** Settings a caller may override; a preset supplies the colours first. */
export type ExportOverrides = Partial<ExportSettings> & {
  readonly preset?: ExportPresetId;
};

function oneOf<T>(field: string, options: readonly T[], value: T): T {
  if (!options.includes(value)) {
    throw new ExportOptionError(
      field,
      `expected one of ${options.map(String).join(", ")}, got ${String(value)}`,
    );
  }

  return value;
}

function inRange(field: string, range: ExportRange, value: number): number {
  if (!Number.isFinite(value) || value < range.min || value > range.max) {
    throw new ExportOptionError(
      field,
      `expected a number from ${String(range.min)} to ${String(range.max)}, got ${String(value)}`,
    );
  }

  return value;
}

function text(field: string, value: string): string {
  if (value.trim() === "") {
    throw new ExportOptionError(field, "must not be empty");
  }

  return value;
}

/**
 * Builds complete settings from the defaults, an optional preset and the
 * caller's own values (in that order of priority, lowest first).
 *
 * @throws ExportOptionError when a value is outside what can be exported.
 */
export function resolveExportSettings(
  overrides: ExportOverrides = {},
): ExportSettings {
  const { preset, ...own } = overrides;

  if (preset !== undefined) {
    oneOf("preset", EXPORT_PRESET_IDS, preset);
  }

  const merged: ExportSettings = {
    ...DEFAULT_EXPORT_SETTINGS,
    ...(preset === undefined ? {} : EXPORT_PRESETS[preset]),
    // Callers from plain JavaScript may pass `undefined` for "not set"
    ...Object.fromEntries(
      Object.entries(own as Record<string, unknown>).filter(
        ([, value]) => value !== undefined,
      ),
    ),
  };

  return {
    format: oneOf("format", EXPORT_FORMATS, merged.format),
    scale: oneOf("scale", EXPORT_SCALES, merged.scale),
    quality: inRange("quality", QUALITY_RANGE, merged.quality),
    ink: text("ink", merged.ink),
    fill: text("fill", merged.fill),
    hollow: merged.hollow,
    background: text("background", merged.background),
    transparent: merged.transparent,
    padding: inRange("padding", PADDING_RANGE, merged.padding),
    radius: inRange("radius", RADIUS_RANGE, merged.radius),
    fileName: merged.fileName,
  };
}
