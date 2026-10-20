import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { applyTheme } from "../lib/apply-theme";
import { COLOR_SCHEME_QUERY } from "../lib/constants";
import { readTheme } from "../model/read-theme";
import type { Theme } from "../model/theme";
import { ThemeProviderContext } from "../model/theme-provider-context";

export interface ThemeProviderProps {
  readonly children: ReactNode;
  readonly defaultTheme?: Theme;
  readonly storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() =>
    readTheme(storageKey, defaultTheme),
  );

  const setTheme = useCallback(
    (next: Theme) => {
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // The choice still applies for this session without storage
      }

      setThemeState(next);
    },
    [storageKey],
  );

  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") {
      return undefined;
    }

    const query = window.matchMedia(COLOR_SCHEME_QUERY);
    const handleChange = (): void => {
      applyTheme("system");
    };

    query.addEventListener("change", handleChange);

    return () => {
      query.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
