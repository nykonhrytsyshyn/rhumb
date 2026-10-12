import { useCallback, useState } from "react";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode, quota); the value then only
    // lives for this session, which is an acceptable degradation
  }
}

/** A string state that survives reloads through localStorage. */
export function usePersistedState(
  key: string,
  fallback: string,
): readonly [string, (value: string) => void] {
  const [value, setValue] = useState(() => read(key) ?? fallback);
  const update = useCallback(
    (next: string) => {
      setValue(next);
      write(key, next);
    },
    [key],
  );

  return [value, update] as const;
}
