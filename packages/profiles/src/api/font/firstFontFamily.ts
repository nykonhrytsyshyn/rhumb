import { fontFamilies } from "./fontFamilies";

/** The first font of a CSS font stack, without quotes: `'A B', Arial` is `A B`. */
export function firstFontFamily(stack: string): string {
  return fontFamilies(stack)[0] ?? "";
}
