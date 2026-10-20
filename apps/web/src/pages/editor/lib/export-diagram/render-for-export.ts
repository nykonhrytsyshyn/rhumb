import { type EngineResult, PRINT_APPEARANCE } from "@rhumb/engine";
import type { StandardProfile } from "@rhumb/profiles";

import { renderDiagram } from "../../api/render-diagram";
import type { ExportOptions } from "./export-options";

export async function renderForExport(
  source: string,
  profile: StandardProfile,
  { transparent }: ExportOptions,
): Promise<EngineResult> {
  return renderDiagram(source, profile, {
    appearance: {
      ...PRINT_APPEARANCE,
      background: transparent ? null : PRINT_APPEARANCE.background,
    },
  });
}
