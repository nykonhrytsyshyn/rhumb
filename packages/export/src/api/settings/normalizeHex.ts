const SHORT = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const LONG = /^#?([0-9a-f]{6})$/i;

/** Turns `#abc`, `abc` or `#AABBCC` into `#aabbcc`; null if it is no colour. */
export function normalizeHex(value: string): string | null {
  const text = value.trim();
  const short = SHORT.exec(text);

  if (short !== null) {
    const [, red = "", green = "", blue = ""] = short;

    return `#${red}${red}${green}${green}${blue}${blue}`.toLowerCase();
  }

  const long = LONG.exec(text);

  return long?.[1] === undefined ? null : `#${long[1].toLowerCase()}`;
}
