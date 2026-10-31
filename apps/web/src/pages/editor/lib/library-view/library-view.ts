import {
  DEFAULT_LIBRARY_PAGE_SIZE,
  type LibraryDateField,
  type LibrarySort,
} from "../../config/library-view";

/**
 * Everything the person sets on the library list: what to find, how to order
 * it and which page to show. Days are kept as `YYYY-MM-DD` strings so that the
 * stored value does not depend on the time zone.
 */
export interface LibraryView {
  readonly query: string;
  readonly sort: LibrarySort;
  readonly dateField: LibraryDateField;
  readonly from: string | null;
  readonly to: string | null;
  readonly profileId: string | null;
  readonly pageSize: number;
  readonly page: number;
}

export const DEFAULT_LIBRARY_VIEW: LibraryView = {
  query: "",
  sort: "updatedDesc",
  dateField: "updated",
  from: null,
  to: null,
  profileId: null,
  pageSize: DEFAULT_LIBRARY_PAGE_SIZE,
  page: 1,
};

export function withoutFilters(view: LibraryView): LibraryView {
  return { ...DEFAULT_LIBRARY_VIEW, query: view.query };
}

export function countActiveFilters(view: LibraryView): number {
  return [
    view.from !== null || view.to !== null,
    view.profileId !== null,
    view.sort !== DEFAULT_LIBRARY_VIEW.sort,
  ].filter(Boolean).length;
}

export function hasFilterChanges(view: LibraryView): boolean {
  return (
    countActiveFilters(view) > 0 ||
    view.dateField !== DEFAULT_LIBRARY_VIEW.dateField ||
    view.pageSize !== DEFAULT_LIBRARY_VIEW.pageSize
  );
}

export function isNarrowed(view: LibraryView): boolean {
  return (
    view.query.trim() !== "" ||
    view.from !== null ||
    view.to !== null ||
    view.profileId !== null
  );
}
