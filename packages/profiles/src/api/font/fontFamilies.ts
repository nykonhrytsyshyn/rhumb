/** Every font of a CSS font stack, without quotes: `'A B', Arial` is `A B`, `Arial`. */
export function fontFamilies(stack: string): readonly string[] {
  const families: string[] = [];

  for (const match of stack.matchAll(/\s*(?:"([^"]*)"|'([^']*)'|([^,]+))/g)) {
    const family = (match[1] ?? match[2] ?? match[3] ?? "").trim();

    if (family !== "") {
      families.push(family);
    }
  }

  return families;
}
