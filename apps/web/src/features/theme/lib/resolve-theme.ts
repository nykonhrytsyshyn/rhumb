import type { ResolvedTheme, Theme } from "../model/theme";
import { getSystemTheme } from "./get-system-theme";

export function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}
