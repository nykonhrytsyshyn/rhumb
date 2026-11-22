import type { EngineResult } from "@rhumb/engine";
import {
  type ExportSettings,
  SvgFontEmbedder,
  SvgFrame,
  toAppearance,
  toFrameOptions,
} from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { renderDiagram } from "../../api/render-diagram";
import { loadEmbeddedFonts } from "./load-embedded-fonts";

export async function renderForExport(
  source: string,
  profile: StandardProfile,
  settings: ExportSettings,
): Promise<EngineResult> {
  const { svg, size } = await renderDiagram(source, profile, {
    appearance: toAppearance(settings),
  });
  const framed = new SvgFrame().wrap(svg, size, toFrameOptions(settings));

  return {
    ...framed,
    svg: new SvgFontEmbedder().embed(
      framed.svg,
      await loadEmbeddedFonts(profile),
    ),
  };
}
