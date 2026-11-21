import type { SvgFrameOptions } from "../svg";
import type { ExportSettings } from "./exportSettings";

/** The page that settings put behind the drawing. */
export function toFrameOptions(settings: ExportSettings): SvgFrameOptions {
  return {
    padding: settings.padding,
    background: settings.transparent ? null : settings.background,
    radius: settings.radius,
  };
}
