import { useContext } from "react";

import { ThemeProviderContext } from "./theme-context";
import type { ThemeProviderState } from "./types";

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }

  return context;
}
