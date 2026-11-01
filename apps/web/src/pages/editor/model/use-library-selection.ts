import { useCallback, useMemo, useState } from "react";

export interface LibrarySelection {
  readonly active: boolean;
  readonly selected: ReadonlySet<string>;
  readonly setActive: (active: boolean) => void;
  readonly toggle: (id: string) => void;
  readonly select: (ids: readonly string[]) => void;
  readonly clear: () => void;
}

export function useLibrarySelection(
  existingIds: readonly string[],
): LibrarySelection {
  const [active, setActiveState] = useState(false);
  const [chosen, setChosen] = useState<ReadonlySet<string>>(new Set());

  const selected = useMemo(() => {
    const existing = new Set(existingIds);

    return new Set([...chosen].filter((id) => existing.has(id)));
  }, [chosen, existingIds]);

  const setActive = useCallback((next: boolean) => {
    setActiveState(next);

    if (!next) {
      setChosen(new Set());
    }
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setChosen(() => {
        const next = new Set(selected);

        if (!next.delete(id)) {
          next.add(id);
        }

        return next;
      });
    },
    [selected],
  );

  const select = useCallback(
    (ids: readonly string[]) => {
      setChosen(new Set([...selected, ...ids]));
    },
    [selected],
  );

  const clear = useCallback(() => {
    setChosen(new Set());
  }, []);

  return { active, selected, setActive, toggle, select, clear };
}
