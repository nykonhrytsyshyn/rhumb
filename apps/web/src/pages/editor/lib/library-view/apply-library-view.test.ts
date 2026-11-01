import { describe, expect, it } from "vitest";

import type { SavedDiagram } from "../../model/diagram/is-saved-diagram";
import {
  applyLibraryView,
  filterDiagrams,
  paginate,
  sortDiagrams,
} from "./apply-library-view";
import { DEFAULT_LIBRARY_VIEW, type LibraryView } from "./library-view";

function at(month: number, day: number, hour = 12): number {
  return new Date(2026, month - 1, day, hour).getTime();
}

function diagram(id: string, patch: Partial<SavedDiagram> = {}): SavedDiagram {
  return {
    id,
    name: id,
    source: "flowchart TD\nA --> B",
    profileId: "iso",
    createdAt: at(1, 1),
    updatedAt: at(1, 1),
    ...patch,
  };
}

function view(patch: Partial<LibraryView>): LibraryView {
  return { ...DEFAULT_LIBRARY_VIEW, ...patch };
}

function ids(items: readonly SavedDiagram[]): readonly string[] {
  return items.map((item) => item.id);
}

describe("filterDiagrams", () => {
  const items = [
    diagram("login", { name: "Login flow", profileId: "iso" }),
    diagram("logout", { name: "Logout", profileId: "gost" }),
    diagram("cart", { name: "Cart", profileId: "iso" }),
  ];

  it("keeps everything for the default view", () => {
    expect(filterDiagrams(items, DEFAULT_LIBRARY_VIEW)).toHaveLength(3);
  });

  it("searches names without regard to case or surrounding spaces", () => {
    expect(ids(filterDiagrams(items, view({ query: "  LOG " })))).toEqual([
      "login",
      "logout",
    ]);
  });

  it("filters by profile", () => {
    expect(ids(filterDiagrams(items, view({ profileId: "gost" })))).toEqual([
      "logout",
    ]);
  });

  it("combines the search with the profile", () => {
    expect(
      ids(filterDiagrams(items, view({ query: "log", profileId: "iso" }))),
    ).toEqual(["login"]);
  });

  describe("date range", () => {
    const dated = [
      diagram("early", { updatedAt: at(3, 1, 0), createdAt: at(1, 5) }),
      diagram("edge-start", { updatedAt: at(3, 10, 0), createdAt: at(2, 5) }),
      diagram("middle", { updatedAt: at(3, 12), createdAt: at(2, 6) }),
      diagram("edge-end", { updatedAt: at(3, 15, 23), createdAt: at(2, 7) }),
      diagram("late", { updatedAt: at(3, 16, 0), createdAt: at(4, 1) }),
    ];

    it("takes both end days whole", () => {
      const result = filterDiagrams(
        dated,
        view({ from: "2026-03-10", to: "2026-03-15" }),
      );

      expect(ids(result)).toEqual(["edge-start", "middle", "edge-end"]);
    });

    it("treats a lone start as that single day", () => {
      expect(
        ids(filterDiagrams(dated, view({ from: "2026-03-12", to: null }))),
      ).toEqual(["middle"]);
    });

    it("treats a lone end as that single day", () => {
      expect(
        ids(filterDiagrams(dated, view({ from: null, to: "2026-03-12" }))),
      ).toEqual(["middle"]);
    });

    it("accepts a range given in reverse", () => {
      expect(
        ids(
          filterDiagrams(dated, view({ from: "2026-03-15", to: "2026-03-10" })),
        ),
      ).toEqual(["edge-start", "middle", "edge-end"]);
    });

    it("compares the creation date when asked to", () => {
      const result = filterDiagrams(
        dated,
        view({ dateField: "created", from: "2026-02-01", to: "2026-02-28" }),
      );

      expect(ids(result)).toEqual(["edge-start", "middle", "edge-end"]);
    });

    it("ignores a range it cannot read", () => {
      expect(
        filterDiagrams(dated, view({ from: "soon", to: "never" })),
      ).toHaveLength(5);
    });
  });
});

describe("sortDiagrams", () => {
  const items = [
    diagram("b", { name: "Item 10", createdAt: 2, updatedAt: 30 }),
    diagram("a", { name: "item 2", createdAt: 3, updatedAt: 10 }),
    diagram("c", { name: "Zeta", createdAt: 1, updatedAt: 20 }),
  ];

  it.each([
    ["updatedDesc", ["b", "c", "a"]],
    ["updatedAsc", ["a", "c", "b"]],
    ["createdDesc", ["a", "b", "c"]],
    ["createdAsc", ["c", "b", "a"]],
    ["nameAsc", ["a", "b", "c"]],
    ["nameDesc", ["c", "b", "a"]],
  ] as const)("orders by %s", (sort, expected) => {
    expect(ids(sortDiagrams(items, sort, "en"))).toEqual(expected);
  });

  it("compares numbers inside names as numbers", () => {
    const names = sortDiagrams(items, "nameAsc", "en").map((item) => item.name);

    expect(names).toEqual(["item 2", "Item 10", "Zeta"]);
  });

  it("orders Ukrainian names by the Ukrainian alphabet", () => {
    const sorted = sortDiagrams(
      [diagram("1", { name: "Їжа" }), diagram("2", { name: "Ів" })],
      "nameAsc",
      "uk",
    );

    expect(sorted.map((item) => item.name)).toEqual(["Ів", "Їжа"]);
  });

  it("does not change the list it was given", () => {
    const before = ids(items);

    sortDiagrams(items, "nameAsc", "en");

    expect(ids(items)).toEqual(before);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => diagram(`d${String(i)}`));

  it("cuts a page out of the list", () => {
    const page = paginate(items, 2, 10);

    expect(ids(page.items)).toEqual(items.slice(10, 20).map((item) => item.id));
    expect(page).toMatchObject({
      total: 25,
      pageCount: 3,
      page: 2,
      first: 11,
      last: 20,
    });
  });

  it("shows what is left on the last page", () => {
    expect(paginate(items, 3, 10)).toMatchObject({
      first: 21,
      last: 25,
      items: expect.arrayContaining([]) as unknown,
    });
    expect(paginate(items, 3, 10).items).toHaveLength(5);
  });

  it("falls back to the last page when the list got shorter", () => {
    expect(paginate(items, 9, 10).page).toBe(3);
  });

  it("falls back to the first page for a page below one", () => {
    expect(paginate(items, 0, 10).page).toBe(1);
  });

  it("has one empty page for an empty list", () => {
    expect(paginate([], 4, 10)).toEqual({
      total: 0,
      pageCount: 1,
      page: 1,
      first: 0,
      last: 0,
      items: [],
    });
  });
});

describe("applyLibraryView", () => {
  it("searches, orders and pages in one go", () => {
    const items = [
      diagram("a", { name: "Alpha", updatedAt: 1 }),
      diagram("b", { name: "Beta", updatedAt: 2 }),
      diagram("c", { name: "Alphabet", updatedAt: 3 }),
    ];
    const result = applyLibraryView(
      items,
      view({ query: "alpha", sort: "nameDesc", pageSize: 6 }),
      "en",
    );

    expect(ids(result.items)).toEqual(["c", "a"]);
    expect(result.total).toBe(2);
  });
});
