import type { Theme } from "../model/theme";
import { THEME_ORDER } from "./constants";

export function isTheme(value: string | null): value is Theme {
  return value !== null && (THEME_ORDER as readonly string[]).includes(value);
}
