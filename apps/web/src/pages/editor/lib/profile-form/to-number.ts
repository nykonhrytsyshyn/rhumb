export function toNumber(text: string): number {
  const trimmed = text.trim().replace(",", ".");

  return trimmed === "" ? Number.NaN : Number(trimmed);
}
