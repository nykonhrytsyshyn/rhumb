import { useCallback, useEffect, useMemo, useState } from "react";

import { COLOR_SCHEME_QUERY, applyTheme, isTheme } from "../lib";
import {
  type Theme,
  ThemeProviderContext,
  type ThemeProviderProps,
} from "../model";

function readTheme(storageKey: string, fallback: Theme): Theme {
  try {
    const stored = window.localStorage.getItem(storageKey);

    return isTheme(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
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
