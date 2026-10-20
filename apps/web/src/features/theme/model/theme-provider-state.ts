import type { Theme } from "./theme";

export interface ThemeProviderState {
  readonly theme: Theme;
  readonly setTheme: (theme: Theme) => void;
}
