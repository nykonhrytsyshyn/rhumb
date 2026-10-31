export const LIBRARY_SORTS = [
  "updatedDesc",
  "updatedAsc",
  "createdDesc",
  "createdAsc",
  "nameAsc",
  "nameDesc",
] as const;

export type LibrarySort = (typeof LIBRARY_SORTS)[number];

export function isLibrarySort(value: string): value is LibrarySort {
  return (LIBRARY_SORTS as readonly string[]).includes(value);
}

/** Which date of a diagram the date range is compared with. */
export const LIBRARY_DATE_FIELDS = ["updated", "created"] as const;

export type LibraryDateField = (typeof LIBRARY_DATE_FIELDS)[number];

export function isLibraryDateField(value: string): value is LibraryDateField {
  return (LIBRARY_DATE_FIELDS as readonly string[]).includes(value);
}

/** The page sizes the person can choose from in the library. */
export const LIBRARY_PAGE_SIZES = [6, 9, 12, 24] as const;

export function isLibraryPageSize(value: number): boolean {
  return (LIBRARY_PAGE_SIZES as readonly number[]).includes(value);
}

export const DEFAULT_LIBRARY_PAGE_SIZE = 12;

/** The profile filter value that lets every profile through. */
export const ALL_PROFILES = "__all__";
