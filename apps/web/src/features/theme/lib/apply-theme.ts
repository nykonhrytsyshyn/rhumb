import type { Theme } from "../model/theme";
import { resolveTheme } from "./resolve-theme";

export function applyTheme(theme: Theme): void {
  const resolved = resolveTheme(theme);
  const root = document.documentElement;

  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}
