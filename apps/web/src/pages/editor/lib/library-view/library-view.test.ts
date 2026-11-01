import { describe, expect, it } from "vitest";

import { fromDayKey, toDayKey } from "./day-key";
import {
  DEFAULT_LIBRARY_VIEW,
  countActiveFilters,
  hasFilterChanges,
  isNarrowed,
  withoutFilters,
} from "./library-view";

describe("day keys", () => {
  it("round-trips a local day", () => {
    const day = new Date(2026, 9, 5, 18, 30);

    expect(toDayKey(day)).toBe("2026-10-05");
    expect(fromDayKey("2026-10-05")).toEqual(new Date(2026, 9, 5));
  });

  it("pads the year so that the key stays sortable", () => {
    expect(toDayKey(new Date(2026, 0, 1))).toBe("2026-01-01");
  });

  it("refuses text that is not a real day", () => {
    expect(fromDayKey("2026-02-31")).toBeUndefined();
    expect(fromDayKey("2026-13-01")).toBeUndefined();
    expect(fromDayKey("26-1-1")).toBeUndefined();
    expect(fromDayKey("")).toBeUndefined();
  });
});

describe("library view helpers", () => {
  it("counts only the options that differ from the default", () => {
    expect(countActiveFilters(DEFAULT_LIBRARY_VIEW)).toBe(0);
    expect(
      countActiveFilters({
        ...DEFAULT_LIBRARY_VIEW,
        from: "2026-03-01",
        to: "2026-03-05",
        profileId: "iso",
        sort: "nameAsc",
      }),
    ).toBe(3);
  });

  it("counts a range as one option however many ends it has", () => {
    expect(
      countActiveFilters({ ...DEFAULT_LIBRARY_VIEW, from: "2026-03-01" }),
    ).toBe(1);
    expect(
      countActiveFilters({ ...DEFAULT_LIBRARY_VIEW, to: "2026-03-01" }),
    ).toBe(1);
  });

  it("does not count the search or the page size as a filter", () => {
    expect(
      countActiveFilters({
        ...DEFAULT_LIBRARY_VIEW,
        query: "x",
        pageSize: 48,
        page: 4,
      }),
    ).toBe(0);
  });

  it("offers a reset once the page size or the date field changed", () => {
    expect(hasFilterChanges(DEFAULT_LIBRARY_VIEW)).toBe(false);
    expect(hasFilterChanges({ ...DEFAULT_LIBRARY_VIEW, pageSize: 6 })).toBe(
      true,
    );
    expect(
      hasFilterChanges({ ...DEFAULT_LIBRARY_VIEW, dateField: "created" }),
    ).toBe(true);
  });

  it("clears the filter but keeps the search", () => {
    const view = {
      ...DEFAULT_LIBRARY_VIEW,
      query: "login",
      profileId: "iso",
      pageSize: 6,
      page: 2,
    };

    expect(withoutFilters(view)).toEqual({
      ...DEFAULT_LIBRARY_VIEW,
      query: "login",
    });
  });

  it("knows when a search or a filter narrows the list", () => {
    expect(isNarrowed(DEFAULT_LIBRARY_VIEW)).toBe(false);
    expect(isNarrowed({ ...DEFAULT_LIBRARY_VIEW, query: "  " })).toBe(false);
    expect(isNarrowed({ ...DEFAULT_LIBRARY_VIEW, query: "a" })).toBe(true);
    expect(isNarrowed({ ...DEFAULT_LIBRARY_VIEW, profileId: "iso" })).toBe(
      true,
    );
    expect(isNarrowed({ ...DEFAULT_LIBRARY_VIEW, sort: "nameAsc" })).toBe(
      false,
    );
  });
});
