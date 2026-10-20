import { isTheme } from "../lib/is-theme";
import type { Theme } from "./theme";

export function readTheme(storageKey: string, fallback: Theme): Theme {
  try {
    const stored = window.localStorage.getItem(storageKey);

    return isTheme(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}
