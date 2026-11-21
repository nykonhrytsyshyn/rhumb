import type { ExportSettings } from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { copyText } from "@shared/lib/copy-text";

import { renderForExport } from "./render-for-export";

export function copySvg(
  source: string,
  profile: StandardProfile,
  settings: ExportSettings,
): Promise<void> {
  return copyText(
    renderForExport(source, profile, settings).then(({ svg }) => svg),
  );
}
