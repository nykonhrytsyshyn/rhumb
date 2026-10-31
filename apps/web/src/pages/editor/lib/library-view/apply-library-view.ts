import type { SavedDiagram } from "../../model/diagram/is-saved-diagram";
import { fromDayKey } from "./day-key";
import type { LibraryView } from "./library-view";

export interface LibraryPage {
  readonly total: number;
  readonly pageCount: number;
  readonly page: number;
  readonly first: number;
  readonly last: number;
  readonly items: readonly SavedDiagram[];
}

function dayBounds(
  view: LibraryView,
): { readonly start: number; readonly end: number } | undefined {
  const from = view.from === null ? undefined : fromDayKey(view.from);
  const to = view.to === null ? undefined : fromDayKey(view.to);
  const first = from ?? to;
  const last = to ?? from;

  if (first === undefined || last === undefined) {
    return undefined;
  }

  const [early, late] = first <= last ? [first, last] : [last, first];

  return {
    start: early.getTime(),
    end: new Date(
      late.getFullYear(),
      late.getMonth(),
      late.getDate() + 1,
    ).getTime(),
  };
}

export function filterDiagrams(
  items: readonly SavedDiagram[],
  view: LibraryView,
): readonly SavedDiagram[] {
  const needle = view.query.trim().toLowerCase();
  const bounds = dayBounds(view);

  return items.filter((item) => {
    if (needle !== "" && !item.name.toLowerCase().includes(needle)) {
      return false;
    }

    if (view.profileId !== null && item.profileId !== view.profileId) {
      return false;
    }

    if (bounds !== undefined) {
      const stamp =
        view.dateField === "created" ? item.createdAt : item.updatedAt;

      return stamp >= bounds.start && stamp < bounds.end;
    }

    return true;
  });
}

export function sortDiagrams(
  items: readonly SavedDiagram[],
  sort: LibraryView["sort"],
  locale: string,
): readonly SavedDiagram[] {
  const collator = new Intl.Collator(locale, {
    numeric: true,
    sensitivity: "base",
  });

  switch (sort) {
    case "updatedDesc":
      return [...items].sort((a, b) => b.updatedAt - a.updatedAt);
    case "updatedAsc":
      return [...items].sort((a, b) => a.updatedAt - b.updatedAt);
    case "createdDesc":
      return [...items].sort((a, b) => b.createdAt - a.createdAt);
    case "createdAsc":
      return [...items].sort((a, b) => a.createdAt - b.createdAt);
    case "nameAsc":
      return [...items].sort((a, b) => collator.compare(a.name, b.name));
    case "nameDesc":
      return [...items].sort((a, b) => collator.compare(b.name, a.name));
  }
}

export function paginate(
  items: readonly SavedDiagram[],
  page: number,
  pageSize: number,
): LibraryPage {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(Math.trunc(page), 1), pageCount);
  const offset = (current - 1) * pageSize;
  const shown = items.slice(offset, offset + pageSize);

  return {
    total,
    pageCount,
    page: current,
    first: shown.length === 0 ? 0 : offset + 1,
    last: offset + shown.length,
    items: shown,
  };
}

export function applyLibraryView(
  items: readonly SavedDiagram[],
  view: LibraryView,
  locale: string,
): LibraryPage {
  return paginate(
    sortDiagrams(filterDiagrams(items, view), view.sort, locale),
    view.page,
    view.pageSize,
  );
}
