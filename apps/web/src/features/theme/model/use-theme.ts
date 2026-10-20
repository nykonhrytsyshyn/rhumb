import { useContext } from "react";

import { ThemeProviderContext } from "./theme-provider-context";
import type { ThemeProviderState } from "./theme-provider-state";

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }

  return context;
}
