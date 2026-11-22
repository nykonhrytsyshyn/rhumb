// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

import { InvalidProfileError } from "@rhumb/profiles";

import {
  CUSTOM_PROFILES_KEY,
  LEGACY_CUSTOM_PROFILE_KEY,
} from "../../config/storage-keys";
import { InvalidProfileTitleError } from "./invalid-profile-title-error";
import { ProfileCatalog } from "./profile-catalog";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));

  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

function setup(initial: Record<string, string> = {}) {
  const storage = memoryStorage(initial);
  let counter = 0;
  const catalog = new ProfileCatalog(
    storage,
    () => `custom-${String((counter += 1))}`,
  );

  return { storage, catalog };
}

function firstProfile(catalog: ProfileCatalog) {
  const [first] = catalog.getSnapshot().all;

  if (first === undefined) {
    throw new Error("Missing profile");
  }

  return first;
}

function storedCustom(storage: ReturnType<typeof memoryStorage>): unknown {
  return JSON.parse(storage.getItem(CUSTOM_PROFILES_KEY) ?? "null");
}

describe("ProfileCatalog", () => {
  it("starts with the built-in standards only, the default one first", () => {
    const { catalog } = setup();
    const { all, builtIn, custom } = catalog.getSnapshot();

    expect(builtIn.length).toBeGreaterThanOrEqual(2);
    expect(builtIn[0]?.default).toBe(true);
    expect(custom).toEqual([]);
    expect(all).toEqual(builtIn);
    expect(all.filter((profile) => profile.default)).toHaveLength(1);
  });

  it("creates a custom copy of any standard under a new name", () => {
    const { catalog, storage } = setup();
    const base = firstProfile(catalog);
    const listener = vi.fn();
    const before = catalog.getSnapshot();

    catalog.subscribe(listener);
    const created = catalog.create(base, "  My standard ");

    expect(created).toMatchObject({
      id: "custom-1",
      title: "My standard",
      default: false,
      grid: base.grid,
      spacing: base.spacing,
    });
    expect(listener).toHaveBeenCalledOnce();
    expect(catalog.getSnapshot()).not.toBe(before);
    expect(catalog.getSnapshot().custom).toEqual([created]);
    expect(catalog.getSnapshot().all.at(-1)).toBe(created);
    expect(storedCustom(storage)).toEqual([created]);
  });

  it("keeps any number of custom standards in the order they were made", () => {
    const { catalog } = setup();
    const base = firstProfile(catalog);

    catalog.create(base, "One");
    catalog.create(base, "Two");
    catalog.create(catalog.getSnapshot().custom[0] ?? base, "Three");

    expect(
      catalog.getSnapshot().custom.map((profile) => profile.title),
    ).toEqual(["One", "Two", "Three"]);
  });

  it("refuses names that are empty, too long or taken", () => {
    const { catalog } = setup();
    const base = firstProfile(catalog);

    catalog.create(base, "Mine");

    expect(catalog.titleIssue("   ")).toBe("empty");
    expect(catalog.titleIssue("x".repeat(61))).toBe("tooLong");
    expect(catalog.titleIssue("  mine ")).toBe("taken");
    expect(catalog.titleIssue(base.title)).toBe("taken");
    expect(catalog.titleIssue("Other")).toBeUndefined();
    expect(() => catalog.create(base, "MINE")).toThrow(
      InvalidProfileTitleError,
    );
    expect(catalog.getSnapshot().custom).toHaveLength(1);
  });

  it("offers the closest free name", () => {
    const { catalog } = setup();
    const base = firstProfile(catalog);

    catalog.create(base, "Mine");
    catalog.create(base, "Mine (2)");

    expect(catalog.uniqueTitle("Fresh")).toBe("Fresh");
    expect(catalog.uniqueTitle("Mine")).toBe("Mine (3)");
  });

  it("replaces the values of a custom standard but keeps its name", () => {
    const { catalog, storage } = setup();
    const created = catalog.create(firstProfile(catalog), "Mine");

    const updated = catalog.update(created.id, {
      ...created,
      title: "Ignored",
      id: "ignored",
      grid: 7,
    });

    expect(updated).toMatchObject({ id: created.id, title: "Mine", grid: 7 });
    expect(catalog.getSnapshot().custom).toEqual([updated]);
    expect(JSON.stringify(storedCustom(storage))).toContain('"grid":7');
  });

  it("renames a custom standard in place", () => {
    const { catalog } = setup();
    const base = firstProfile(catalog);
    const first = catalog.create(base, "First");

    catalog.create(base, "Second");
    const renamed = catalog.rename(first.id, "Renamed");

    expect(renamed.title).toBe("Renamed");
    expect(catalog.getSnapshot().custom.map((profile) => profile.id)).toEqual([
      "custom-1",
      "custom-2",
    ]);
    expect(() => catalog.rename(first.id, "Second")).toThrow(
      InvalidProfileTitleError,
    );
    expect(catalog.rename(first.id, "renamed").title).toBe("renamed");
  });

  it("removes a custom standard", () => {
    const { catalog, storage } = setup();
    const base = firstProfile(catalog);
    const first = catalog.create(base, "First");
    const second = catalog.create(base, "Second");

    catalog.remove(first.id);

    expect(catalog.getSnapshot().custom).toEqual([second]);
    expect(storedCustom(storage)).toEqual([second]);
  });

  it("never changes or removes a built-in standard", () => {
    const { catalog } = setup();
    const base = firstProfile(catalog);

    expect(() => {
      catalog.remove(base.id);
    }).toThrow();
    expect(() => catalog.rename(base.id, "Mine")).toThrow();
    expect(() => catalog.update(base.id, base)).toThrow();
  });

  it("imports a loaded profile as a new custom standard", () => {
    const { catalog } = setup();
    const base = firstProfile(catalog);

    const imported = catalog.importProfile({
      ...base,
      id: "from-file",
      title: base.title,
      grid: 11,
      default: true,
    });

    expect(imported).toMatchObject({
      id: "custom-1",
      title: `${base.title} (2)`,
      default: false,
      grid: 11,
    });
    expect(catalog.getSnapshot().all.filter((p) => p.default)).toHaveLength(1);
  });

  it("rejects an invalid profile without notifying", () => {
    const { catalog } = setup();
    const listener = vi.fn();

    catalog.subscribe(listener);

    expect(() => catalog.importProfile({ id: "x" })).toThrow(
      InvalidProfileError,
    );
    expect(listener).not.toHaveBeenCalled();
  });

  it("stops notifying after unsubscribing", () => {
    const { catalog } = setup();
    const listener = vi.fn();
    const unsubscribe = catalog.subscribe(listener);

    unsubscribe();
    catalog.create(firstProfile(catalog), "Mine");

    expect(listener).not.toHaveBeenCalled();
  });

  it("restores the custom standards saved on a previous visit", () => {
    const first = setup();
    const base = firstProfile(first.catalog);

    first.catalog.create(base, "One");
    first.catalog.create({ ...base, grid: 9 }, "Two");

    const restored = new ProfileCatalog(first.storage).getSnapshot().custom;

    expect(restored.map((profile) => profile.title)).toEqual(["One", "Two"]);
    expect(restored[1]?.grid).toBe(9);
  });

  it("drops damaged or clashing entries and keeps the rest", () => {
    const { catalog: probe } = setup();
    const base = firstProfile(probe);
    const stored = JSON.stringify([
      { id: "x" },
      { ...base, id: "ok-1", title: "Same", default: true },
      { ...base, id: "ok-2", title: "same" },
      { ...base, id: base.id, title: "Steals a built-in id" },
      { ...base, id: "ok-1", title: "Repeats an id" },
    ]);
    const { catalog } = setup({ [CUSTOM_PROFILES_KEY]: stored });
    const { custom } = catalog.getSnapshot();

    expect(custom.map((profile) => [profile.id, profile.title])).toEqual([
      ["ok-1", "Same"],
      ["ok-2", "same (2)"],
    ]);
    expect(custom.every((profile) => !profile.default)).toBe(true);
  });

  it("ignores a stored value that is not JSON", () => {
    const { catalog } = setup({ [CUSTOM_PROFILES_KEY]: "not json" });

    expect(catalog.getSnapshot().custom).toEqual([]);
  });

  it("turns the single custom standard of earlier versions into the first one", () => {
    const { catalog: probe } = setup();
    const base = firstProfile(probe);
    const { catalog, storage } = setup({
      [LEGACY_CUSTOM_PROFILE_KEY]: JSON.stringify({
        ...base,
        id: "custom",
        title: "Custom",
        grid: 6,
      }),
    });

    expect(catalog.getSnapshot().custom).toMatchObject([
      { id: "custom", title: "Custom", grid: 6 },
    ]);
    expect(storage.getItem(LEGACY_CUSTOM_PROFILE_KEY)).toBeNull();
    expect(storedCustom(storage)).toMatchObject([{ id: "custom" }]);
    expect(new ProfileCatalog(storage).getSnapshot().custom).toHaveLength(1);
  });

  it("prefers the new storage over the old one", () => {
    const { catalog: probe } = setup();
    const base = firstProfile(probe);
    const { catalog } = setup({
      [CUSTOM_PROFILES_KEY]: JSON.stringify([
        { ...base, id: "new", title: "New one" },
      ]),
      [LEGACY_CUSTOM_PROFILE_KEY]: JSON.stringify({ ...base, id: "custom" }),
    });

    expect(catalog.getSnapshot().custom.map((profile) => profile.id)).toEqual([
      "new",
    ]);
  });

  it("keeps working when storage is unavailable", () => {
    const denied = () => {
      throw new Error("denied");
    };
    const catalog = new ProfileCatalog({
      getItem: denied,
      setItem: denied,
      removeItem: denied,
    });

    expect(
      catalog.create({ ...firstProfile(catalog), grid: 6 }, "Mine").grid,
    ).toBe(6);
    expect(catalog.getSnapshot().custom).toHaveLength(1);
  });
});
