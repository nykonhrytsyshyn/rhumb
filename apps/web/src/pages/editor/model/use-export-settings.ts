import { useCallback, useMemo } from "react";

import {
  DEFAULT_EXPORT_SETTINGS,
  EXPORT_PRESETS,
  type ExportPresetId,
  type ExportSettings,
  parseExportSettings,
} from "@rhumb/export";

import { usePersistedState } from "@shared/lib/use-persisted-state";

import { EXPORT_SETTINGS_KEY } from "../config/storage-keys";

export interface ExportSettingsModel {
  readonly settings: ExportSettings;
  readonly change: (patch: Partial<ExportSettings>) => void;
  readonly applyPreset: (id: ExportPresetId) => void;
  readonly reset: () => void;
}

export function useExportSettings(): ExportSettingsModel {
  const [raw, setRaw] = usePersistedState(
    EXPORT_SETTINGS_KEY,
    JSON.stringify(DEFAULT_EXPORT_SETTINGS),
  );
  const settings = useMemo(() => parseExportSettings(raw), [raw]);

  const change = useCallback(
    (patch: Partial<ExportSettings>) => {
      setRaw(JSON.stringify({ ...settings, ...patch }));
    },
    [settings, setRaw],
  );

  const applyPreset = useCallback(
    (id: ExportPresetId) => {
      setRaw(JSON.stringify({ ...settings, ...EXPORT_PRESETS[id] }));
    },
    [settings, setRaw],
  );

  const reset = useCallback(() => {
    setRaw(JSON.stringify(DEFAULT_EXPORT_SETTINGS));
  }, [setRaw]);

  return { settings, change, applyPreset, reset };
}
