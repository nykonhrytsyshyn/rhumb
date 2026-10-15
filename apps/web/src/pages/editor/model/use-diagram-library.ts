import { useCallback, useEffect, useState } from "react";

import type { LabelStyle } from "@rhumb/engine";

import {
  type DiagramStore,
  type SavedDiagram,
  diagramStore,
  requestPersistentStorage,
} from "./diagram-store";

export interface DiagramInput {
  readonly name: string;
  readonly source: string;
  readonly profileId: string;
  readonly labelStyle: LabelStyle;
}

export interface DiagramLibrary {
  /** The saved diagrams, newest first; undefined while they load. */
  readonly items: readonly SavedDiagram[] | undefined;
  /** What went wrong with the last operation, if anything. */
  readonly error: string | null;
  readonly create: (input: DiagramInput) => Promise<SavedDiagram | undefined>;
  readonly update: (
    id: string,
    patch: Partial<DiagramInput>,
  ) => Promise<SavedDiagram | undefined>;
  readonly duplicate: (
    id: string,
    name: string,
  ) => Promise<SavedDiagram | undefined>;
  readonly remove: (id: string) => Promise<boolean>;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function newestFirst(items: readonly SavedDiagram[]): readonly SavedDiagram[] {
  return [...items].sort((a, b) => b.updatedAt - a.updatedAt);
}

/** The user's saved diagrams, kept in the browser's storage. */
export function useDiagramLibrary(
  store: DiagramStore = diagramStore,
  now: () => number = Date.now,
  createId: () => string = () => crypto.randomUUID(),
): DiagramLibrary {
  const [items, setItems] = useState<readonly SavedDiagram[] | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    store.list().then(
      (loaded) => {
        if (!cancelled) {
          setItems(loaded);
        }
      },
      (failure: unknown) => {
        if (!cancelled) {
          setItems([]);
          setError(messageOf(failure));
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [store]);

  const save = useCallback(
    async (diagram: SavedDiagram): Promise<SavedDiagram | undefined> => {
      try {
        await store.put(diagram);
        setError(null);
        setItems((previous) =>
          newestFirst([
            diagram,
            ...(previous ?? []).filter((item) => item.id !== diagram.id),
          ]),
        );
        // Ask only once something worth keeping exists.
        void requestPersistentStorage();

        return diagram;
      } catch (failure) {
        setError(messageOf(failure));

        return undefined;
      }
    },
    [store],
  );

  const create = useCallback(
    (input: DiagramInput) => {
      const stamp = now();

      return save({
        ...input,
        id: createId(),
        createdAt: stamp,
        updatedAt: stamp,
      });
    },
    [save, now, createId],
  );

  const update = useCallback(
    (id: string, patch: Partial<DiagramInput>) => {
      const existing = items?.find((item) => item.id === id);

      return existing === undefined
        ? Promise.resolve(undefined)
        : save({ ...existing, ...patch, updatedAt: now() });
    },
    [items, save, now],
  );

  const duplicate = useCallback(
    (id: string, name: string) => {
      const existing = items?.find((item) => item.id === id);

      if (existing === undefined) {
        return Promise.resolve(undefined);
      }

      const stamp = now();

      return save({
        ...existing,
        id: createId(),
        name,
        createdAt: stamp,
        updatedAt: stamp,
      });
    },
    [items, save, now, createId],
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await store.remove(id);
        setError(null);
        setItems((previous) => previous?.filter((item) => item.id !== id));

        return true;
      } catch (failure) {
        setError(messageOf(failure));

        return false;
      }
    },
    [store],
  );

  return { items, error, create, update, duplicate, remove };
}
