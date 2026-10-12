export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Rect extends Point, Size {}

export enum Side {
  Top = "top",
  Right = "right",
  Bottom = "bottom",
  Left = "left",
}

/** Rounds `value` up to the nearest multiple of `step`. */
export function snapUp(value: number, step: number): number {
  if (step <= 0) {
    return value;
  }

  return Math.ceil(value / step - 1e-9) * step;
}

/** Rounds to `digits` decimals to keep generated markup compact. */
export function roundTo(value: number, digits = 2): number {
  const factor = 10 ** digits;

  return Math.round(value * factor) / factor;
}
