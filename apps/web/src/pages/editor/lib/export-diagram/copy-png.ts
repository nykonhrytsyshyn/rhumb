import type { StandardProfile } from "@rhumb/profiles";

import type { ExportOptions } from "./export-options";
import { renderPng } from "./render-png";

export async function copyPng(
  source: string,
  profile: StandardProfile,
  options: ExportOptions,
): Promise<void> {
  const blob = await renderPng(source, profile, options);

  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}
