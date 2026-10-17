/**
 * Hand-written readers for Mermaid link tokens (`-->`, `---`, `==>`, `-.->`).
 *
 * These deliberately avoid regular expressions: patterns such as `\.+->`
 * backtrack polynomially on long runs of repeated characters, and the input
 * is untrusted. Every function here walks each character at most once.
 */

function runLength(text: string, index: number, char: string): number {
  let end = index;

  while (text.charAt(end) === char) end += 1;

  return end - index;
}

/** `-{2,}>` | `-{3,}` (or the same with `=`), anchored at `index`. */
function readRepeated(
  text: string,
  index: number,
  char: "-" | "=",
): number | undefined {
  const count = runLength(text, index, char);

  if (count >= 2 && text.charAt(index + count) === ">")
    return index + count + 1;
  if (count >= 3) return index + count;

  return undefined;
}

/** `\.+-` optionally followed by `>`, anchored at `index` (first dot). */
function readDotted(text: string, index: number): number | undefined {
  const dots = runLength(text, index, ".");

  if (dots === 0 || text.charAt(index + dots) !== "-") return undefined;

  const end = index + dots + 1;

  return text.charAt(end) === ">" ? end + 1 : end;
}

/** End offset of a link token that closes a labelled link, e.g. `-->` or `.->`. */
export function readClosingToken(
  text: string,
  index: number,
): number | undefined {
  const first = text.charAt(index);

  if (first === "-" || first === "=") return readRepeated(text, index, first);
  if (first === ".") return readDotted(text, index);

  return undefined;
}

/** End offset of a standalone link token, e.g. `-->`, `==>`, `-.->`. */
export function readStandaloneToken(
  text: string,
  index: number,
): number | undefined {
  const first = text.charAt(index);

  if (first === "=") return readRepeated(text, index, first);
  if (first !== "-") return undefined;

  return (
    readRepeated(text, index, first) ??
    (text.charAt(index + 1) === "." ? readDotted(text, index + 1) : undefined)
  );
}
