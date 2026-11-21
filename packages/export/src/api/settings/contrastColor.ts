import { normalizeHex } from "./normalizeHex";

function channel(hex: string, offset: number): number {
  const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;

  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function contrastColor(color: string): "#000000" | "#ffffff" {
  const hex = normalizeHex(color);

  if (hex === null) {
    return "#ffffff";
  }

  const luminance =
    0.2126 * channel(hex, 1) +
    0.7152 * channel(hex, 3) +
    0.0722 * channel(hex, 5);

  return luminance > 0.179 ? "#000000" : "#ffffff";
}
