import { EXPORT_PRESETS } from "./exportPresets";
import type { ExportSettings } from "./exportSettings";

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: "png",
  scale: 2,
  quality: 92,
  ...EXPORT_PRESETS.print,
  padding: 0,
  radius: 0,
  fileName: "",
};
