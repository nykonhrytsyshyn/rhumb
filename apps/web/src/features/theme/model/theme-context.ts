import { createContext } from "react";

import type { ThemeProviderState } from "./types";

export const ThemeProviderContext = createContext<
  ThemeProviderState | undefined
>(undefined);
