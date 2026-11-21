import Color from "color";

export interface HsvColor {
  readonly hue: number;
  readonly saturation: number;
  readonly brightness: number;
  readonly alpha: number;
}

export interface FormattedColor {
  readonly hex: string;
  readonly output: string;
  readonly rgb: readonly [number, number, number];
  readonly hsl: readonly [number, number, number];
}

export const DEFAULT_HSV: HsvColor = {
  hue: 0,
  saturation: 0,
  brightness: 0,
  alpha: 100,
};

const SHORT_HEX = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const LONG_HEX = /^#?([0-9a-f]{6})$/i;

export function normalizeHexColor(value: string): string | null {
  const text = value.trim();
  const short = SHORT_HEX.exec(text);

  if (short !== null) {
    const [, red = "", green = "", blue = ""] = short;

    return `#${red}${red}${green}${green}${blue}${blue}`.toLowerCase();
  }

  const long = LONG_HEX.exec(text);

  return long?.[1] === undefined ? null : `#${long[1].toLowerCase()}`;
}

export function hsvToHsl(
  hue: number,
  saturation: number,
  brightness: number,
): readonly [number, number, number] {
  const s = saturation / 100;
  const v = brightness / 100;
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

  return [hue, sl * 100, l * 100];
}

export function hslToHsv(
  hue: number,
  saturation: number,
  lightness: number,
): readonly [number, number, number] {
  const s = saturation / 100;
  const l = lightness / 100;
  const v = l + s * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);

  return [hue, sv * 100, v * 100];
}

export function parseColorToHsv(raw: string): HsvColor | null {
  try {
    const parsed = Color(raw);
    const hsl = parsed.hsl();
    const [hue, saturation, brightness] = hslToHsv(
      hsl.hue(),
      hsl.saturationl(),
      hsl.lightness(),
    );

    return {
      hue,
      saturation,
      brightness,
      alpha: Math.round(parsed.alpha() * 100),
    };
  } catch {
    return null;
  }
}

export function formatHsv(hsv: HsvColor, includeAlpha = false): FormattedColor {
  const [hue, sl, lightness] = hsvToHsl(
    hsv.hue % 360,
    hsv.saturation,
    hsv.brightness,
  );
  const base = Color.hsl(hue, sl, lightness);
  const hex = base.hex().toLowerCase();
  const [r = 0, g = 0, b = 0] = base
    .rgb()
    .array()
    .map((channel) => Math.round(channel));
  const alphaByte = Math.round((hsv.alpha / 100) * 255)
    .toString(16)
    .padStart(2, "0");

  return {
    hex,
    output: includeAlpha && hsv.alpha < 100 ? `${hex}${alphaByte}` : hex,
    rgb: [r, g, b],
    hsl: [Math.round(hue), Math.round(sl), Math.round(lightness)],
  };
}
