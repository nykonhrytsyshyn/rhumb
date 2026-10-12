import type { ResolvedTheme, Theme } from "../model/types";

export const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export const THEME_ORDER: readonly Theme[] = ["light", "dark", "system"];

export function isTheme(value: string | null): value is Theme {
  return value !== null && (THEME_ORDER as readonly string[]).includes(value);
}

export function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light";
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

export function nextTheme(theme: Theme): Theme {
  const index = THEME_ORDER.indexOf(theme);

  return THEME_ORDER[(index + 1) % THEME_ORDER.length] ?? "system";
}

export function applyTheme(theme: Theme): void {
  const resolved = resolveTheme(theme);
  const root = document.documentElement;

  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}
