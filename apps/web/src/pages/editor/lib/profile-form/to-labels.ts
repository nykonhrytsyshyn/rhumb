export function toLabels(text: string): string[] {
  return text
    .split(",")
    .map((label) => label.trim())
    .filter((label) => label !== "");
}
