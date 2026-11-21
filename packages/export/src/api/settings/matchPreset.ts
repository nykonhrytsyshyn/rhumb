import {
  EXPORT_PRESETS,
  EXPORT_PRESET_IDS,
  type ExportPresetId,
} from "./exportPresets";
import type { ExportSettings } from "./exportSettings";

/** The preset whose colours the settings still use, or null once edited. */
export function matchPreset(settings: ExportSettings): ExportPresetId | null {
  return (
    EXPORT_PRESET_IDS.find((id) => {
      const colors = EXPORT_PRESETS[id];

      return (
        colors.transparent === settings.transparent &&
        colors.hollow === settings.hollow &&
        colors.ink === settings.ink &&
        colors.fill === settings.fill &&
        // A page that is not drawn has no colour worth comparing
        (settings.transparent || colors.background === settings.background)
      );
    }) ?? null
  );
}
