import { useCallback, useMemo } from "react";

import { usePersistedState } from "@shared/lib/use-persisted-state";

import {
  isLibraryDateField,
  isLibraryPageSize,
  isLibrarySort,
} from "../config/library-view.ts";
import { LIBRARY_VIEW_KEY } from "../config/storage-keys.ts";
import {
  DEFAULT_LIBRARY_VIEW,
  type LibraryView,
  fromDayKey,
  parseLibraryView,
  toDayKey,
  withoutFilters,
} from "../lib/library-view";

export interface LibraryRange {
  readonly from: Date | undefined;
  readonly to?: Date | undefined;
}

export interface LibraryViewState {
  readonly view: LibraryView;
  readonly range: LibraryRange | undefined;
  readonly setQuery: (query: string) => void;
  readonly setSort: (sort: string) => void;
  readonly setDateField: (field: string) => void;
  readonly setRange: (range: LibraryRange | undefined) => void;
  readonly setProfile: (profileId: string | null) => void;
  readonly setPageSize: (size: number) => void;
  readonly setPage: (page: number) => void;
  readonly resetFilters: () => void;
  readonly resetAll: () => void;
}

function toKey(date: Date | undefined): string | null {
  return date === undefined ? null : toDayKey(date);
}

export function useLibraryView(): LibraryViewState {
  const [raw, setRaw] = usePersistedState(
    LIBRARY_VIEW_KEY,
    JSON.stringify(DEFAULT_LIBRARY_VIEW),
  );
  const view = useMemo(() => parseLibraryView(raw), [raw]);

  const write = useCallback(
    (next: LibraryView) => {
      setRaw(JSON.stringify(next));
    },
    [setRaw],
  );

  const change = useCallback(
    (patch: Partial<LibraryView>) => {
      write({ ...view, page: 1, ...patch });
    },
    [view, write],
  );

  const range = useMemo((): LibraryRange | undefined => {
    const from = view.from === null ? undefined : fromDayKey(view.from);
    const to = view.to === null ? undefined : fromDayKey(view.to);

    return from === undefined && to === undefined ? undefined : { from, to };
  }, [view.from, view.to]);

  return {
    view,
    range,
    setQuery: (query) => {
      change({ query });
    },
    setSort: (sort) => {
      if (isLibrarySort(sort)) {
        change({ sort });
      }
    },
    setDateField: (dateField) => {
      if (isLibraryDateField(dateField)) {
        change({ dateField });
      }
    },
    setRange: (next) => {
      change({ from: toKey(next?.from), to: toKey(next?.to) });
    },
    setProfile: (profileId) => {
      change({ profileId });
    },
    setPageSize: (pageSize) => {
      if (isLibraryPageSize(pageSize)) {
        change({ pageSize });
      }
    },
    setPage: (page) => {
      write({ ...view, page: Math.max(1, Math.trunc(page)) });
    },
    resetFilters: () => {
      write(withoutFilters(view));
    },
    resetAll: () => {
      write(DEFAULT_LIBRARY_VIEW);
    },
  };
}
