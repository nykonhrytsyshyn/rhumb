import type { EngineResult } from "@rhumb/engine";
import {
  type ExportSettings,
  SvgFrame,
  toAppearance,
  toFrameOptions,
} from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { renderDiagram } from "../../api/render-diagram";

export async function renderForExport(
  source: string,
  profile: StandardProfile,
  settings: ExportSettings,
): Promise<EngineResult> {
  const { svg, size } = await renderDiagram(source, profile, {
    appearance: toAppearance(settings),
  });

  return new SvgFrame().wrap(svg, size, toFrameOptions(settings));
}
