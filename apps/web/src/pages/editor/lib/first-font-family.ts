/** The first font of a CSS font stack, without quotes: `'A B', Arial` is `A B`. */
export function firstFontFamily(stack: string): string {
  const first = stack.split(",")[0] ?? "";

  return first
    .trim()
    .replace(/^(['"])(.*)\1$/, "$2")
    .trim();
}
