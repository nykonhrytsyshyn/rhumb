import type { ResolvedTheme } from "../model/theme";
import { COLOR_SCHEME_QUERY } from "./constants";

export function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light";
}
