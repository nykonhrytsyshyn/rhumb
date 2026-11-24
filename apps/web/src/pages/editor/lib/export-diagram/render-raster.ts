import type { RasterFormat } from "@nykon/rhumb";

import type { ExportSettings } from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { rhumb } from "../../api/rhumb";
import { toRenderOptions } from "./to-render-options";

export async function renderRaster(
  source: string,
  profile: StandardProfile,
  settings: ExportSettings,
  format: RasterFormat,
): Promise<Blob> {
  const image = await rhumb.renderImage(source, {
    ...(await toRenderOptions(profile, settings)),
    format,
  });

  return image.blob;
}
