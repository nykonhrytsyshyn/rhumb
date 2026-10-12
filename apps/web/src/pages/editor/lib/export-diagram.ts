import { type EngineResult, PRINT_APPEARANCE } from "@rhumb/engine";
import { CanvasRasterizer, PngExporter } from "@rhumb/export";
import type { StandardProfile } from "@rhumb/profiles";

import { renderDiagram } from "../api/render-diagram";
import { downloadBlob } from "./download";

const PNG_SCALE = 2;

export interface ExportOptions {
  readonly transparent: boolean;
}

/** Exports are always drawn in black ink so they print and embed well. */
async function renderForExport(
  source: string,
  profile: StandardProfile,
  { transparent }: ExportOptions,
): Promise<EngineResult> {
  return renderDiagram(source, profile, {
    ...PRINT_APPEARANCE,
    background: transparent ? null : PRINT_APPEARANCE.background,
  });
}

async function renderPng(
  source: string,
  profile: StandardProfile,
  options: ExportOptions,
): Promise<Blob> {
  const { svg, size } = await renderForExport(source, profile, options);
  const rasterizer = new CanvasRasterizer(
    options.transparent ? null : PRINT_APPEARANCE.background,
  );

  return new PngExporter(rasterizer).export(svg, size, PNG_SCALE);
}

export async function exportSvg(
  source: string,
  profile: StandardProfile,
  options: ExportOptions,
): Promise<void> {
  const { svg } = await renderForExport(source, profile, options);

  downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${profile.id}.svg`);
}

export async function exportPng(
  source: string,
  profile: StandardProfile,
  options: ExportOptions,
): Promise<void> {
  downloadBlob(await renderPng(source, profile, options), `${profile.id}.png`);
}

export async function copyPng(
  source: string,
  profile: StandardProfile,
  options: ExportOptions,
): Promise<void> {
  const blob = await renderPng(source, profile, options);

  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

/** Saves a profile as JSON so it can be edited and loaded back. */
export function downloadProfile(profile: StandardProfile): void {
  downloadBlob(
    new Blob([`${JSON.stringify(profile, null, 2)}\n`], {
      type: "application/json",
    }),
    `${profile.id}.json`,
  );
}
