/** A `Storage` stand-in that keeps values in memory, for tests. */
export function memoryStorage(initial: Readonly<Record<string, string>> = {}) {
  const data = new Map<string, string>(Object.entries(initial));

  return {
    getItem: (key: string): string | null => data.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      data.set(key, value);
    },
  };
}
