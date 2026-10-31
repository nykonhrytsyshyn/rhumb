import {
  LIBRARY_DATE_FIELDS,
  LIBRARY_PAGE_SIZES,
  LIBRARY_SORTS,
  type LibraryDateField,
  type LibrarySort,
} from "../../config/library-view";
import { fromDayKey } from "./day-key";
import { DEFAULT_LIBRARY_VIEW, type LibraryView } from "./library-view";

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === "string" &&
    (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function dayOrNull(value: unknown): string | null {
  return typeof value === "string" && fromDayKey(value) !== undefined
    ? value
    : null;
}

export function parseLibraryView(raw: string): LibraryView {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_LIBRARY_VIEW;
  }

  if (typeof parsed !== "object" || parsed === null) {
    return DEFAULT_LIBRARY_VIEW;
  }

  const record = parsed as Record<string, unknown>;
  const pageSize = LIBRARY_PAGE_SIZES.find((size) => size === record.pageSize);
  const page = record.page;

  return {
    query: typeof record.query === "string" ? record.query : "",
    sort: oneOf<LibrarySort>(
      record.sort,
      LIBRARY_SORTS,
      DEFAULT_LIBRARY_VIEW.sort,
    ),
    dateField: oneOf<LibraryDateField>(
      record.dateField,
      LIBRARY_DATE_FIELDS,
      DEFAULT_LIBRARY_VIEW.dateField,
    ),
    from: dayOrNull(record.from),
    to: dayOrNull(record.to),
    profileId:
      typeof record.profileId === "string" && record.profileId !== ""
        ? record.profileId
        : null,
    pageSize: pageSize ?? DEFAULT_LIBRARY_VIEW.pageSize,
    page:
      typeof page === "number" && Number.isInteger(page) && page >= 1
        ? page
        : 1,
  };
}
