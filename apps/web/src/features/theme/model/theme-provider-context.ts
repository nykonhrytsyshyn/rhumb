import { createContext } from "react";

import type { ThemeProviderState } from "./theme-provider-state";

export const ThemeProviderContext = createContext<
  ThemeProviderState | undefined
>(undefined);
