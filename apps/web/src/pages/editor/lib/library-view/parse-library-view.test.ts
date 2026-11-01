import { describe, expect, it } from "vitest";

import { DEFAULT_LIBRARY_VIEW } from "./library-view";
import { parseLibraryView } from "./parse-library-view";

describe("parseLibraryView", () => {
  it("returns the default for text that is not JSON", () => {
    expect(parseLibraryView("{broken")).toEqual(DEFAULT_LIBRARY_VIEW);
  });

  it("returns the default for JSON that is not an object", () => {
    expect(parseLibraryView("null")).toEqual(DEFAULT_LIBRARY_VIEW);
    expect(parseLibraryView("[1]")).toEqual(DEFAULT_LIBRARY_VIEW);
    expect(parseLibraryView('"text"')).toEqual(DEFAULT_LIBRARY_VIEW);
  });

  it("reads a view it wrote itself", () => {
    const view = {
      query: "login",
      sort: "nameAsc",
      dateField: "created",
      from: "2026-03-01",
      to: "2026-03-31",
      profileId: "gost",
      pageSize: 24,
      page: 3,
    };

    expect(parseLibraryView(JSON.stringify(view))).toEqual(view);
  });

  it("replaces each unusable value on its own", () => {
    const parsed = parseLibraryView(
      JSON.stringify({
        query: 5,
        sort: "random",
        dateField: "deleted",
        from: "2026-02-31",
        to: "tomorrow",
        profileId: "",
        pageSize: 7,
        page: 1.5,
      }),
    );

    expect(parsed).toEqual(DEFAULT_LIBRARY_VIEW);
  });

  it("keeps the values that are fine next to the ones that are not", () => {
    const parsed = parseLibraryView(
      JSON.stringify({ query: "cart", sort: "nope", page: 2 }),
    );

    expect(parsed).toEqual({ ...DEFAULT_LIBRARY_VIEW, query: "cart", page: 2 });
  });

  it("does not accept a page below one", () => {
    expect(parseLibraryView(JSON.stringify({ page: 0 })).page).toBe(1);
    expect(parseLibraryView(JSON.stringify({ page: -4 })).page).toBe(1);
  });
});
