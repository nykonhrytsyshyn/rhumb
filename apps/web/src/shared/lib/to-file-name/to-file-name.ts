/** A name that is safe to use for a downloaded file. */
export function toFileName(name: string, fallback = "diagram"): string {
  const cleaned = name
    .replace(/[\\/:*?"<>|\p{Cc}]+/gu, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+/, "");

  return cleaned === "" ? fallback : cleaned.slice(0, 80);
}
