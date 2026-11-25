import type { RenderResult } from "@nykon/rhumb";

import type { ExportSettings } from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { rhumb } from "../../api/rhumb";
import { toRenderOptions } from "./to-render-options";

export async function renderForExport(
  source: string,
  profile: StandardProfile,
  settings: ExportSettings,
): Promise<RenderResult> {
  return rhumb.render(source, await toRenderOptions(profile, settings));
}
