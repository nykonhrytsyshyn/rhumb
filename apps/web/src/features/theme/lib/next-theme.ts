import type { Theme } from "../model/theme";
import { THEME_ORDER } from "./constants";

export function nextTheme(theme: Theme): Theme {
  const index = THEME_ORDER.indexOf(theme);

  return THEME_ORDER[(index + 1) % THEME_ORDER.length] ?? "system";
}
