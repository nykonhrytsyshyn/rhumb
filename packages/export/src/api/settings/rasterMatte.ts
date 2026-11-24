import type { ExportSettings } from "./exportSettings";

const JPEG_MATTE = "#ffffff";

/**
 * Colour to paint under the drawing before encoding it, or null to keep
 * transparency. JPEG cannot be see-through, so it gets a solid page.
 */
export function rasterMatte(
  format: "png" | "jpeg" | "webp",
  { transparent, background }: ExportSettings,
): string | null {
  if (format !== "jpeg") {
    return null;
  }

  return transparent ? JPEG_MATTE : background;
}
