import { contrastColor } from "./contrastColor";
import type { ExportSettings } from "./exportSettings";

/** Colours a drawing is painted with; the engine's `Appearance` has this shape. */
export interface ExportAppearance {
  readonly ink: string;
  readonly fill: string;
  readonly background: string | null;
  readonly labelBackground: string;
}

/**
 * Colours the engine draws with. The page itself is added afterwards, around
 * the finished drawing, so the engine always renders without one.
 */
export function toAppearance(settings: ExportSettings): ExportAppearance {
  const { ink, fill, hollow, background, transparent } = settings;

  // Labels on lines need a backdrop of their own; without a page it comes
  // from the blocks, or from the opposite of the ink when blocks are hollow
  const labelBackground = transparent
    ? hollow
      ? contrastColor(ink)
      : fill
    : background;

  return {
    ink,
    fill: hollow ? "none" : fill,
    background: null,
    labelBackground,
  };
}
