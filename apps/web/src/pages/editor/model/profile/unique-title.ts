import { MAX_TITLE_LENGTH, checkTitle } from "./check-title";

/** Turns a wish for a name into one that is free: "Name", "Name (2)", ... */
export function uniqueTitle(title: string, taken: readonly string[]): string {
  const base = title.trim().slice(0, MAX_TITLE_LENGTH).trim();

  if (base !== "" && checkTitle(base, taken) === undefined) {
    return base;
  }

  for (let number = 2; ; number += 1) {
    const suffix = ` (${String(number)})`;
    const candidate = `${base.slice(0, MAX_TITLE_LENGTH - suffix.length).trim()}${suffix}`;

    if (checkTitle(candidate, taken) === undefined) {
      return candidate;
    }
  }
}
