// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

import { InvalidProfileError } from "@rhumb/profiles";

import { CUSTOM_PROFILE_KEY } from "../../config/storage-keys";
import { CUSTOM_PROFILE_ID, ProfileCatalog } from "./profile-catalog";

function memoryStorage(initial?: string) {
  const data = new Map<string, string>();

  if (initial !== undefined) {
    data.set(CUSTOM_PROFILE_KEY, initial);
  }

  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

function firstProfile(catalog: ProfileCatalog) {
  const [first] = catalog.getSnapshot();

  if (first === undefined) {
    throw new Error("Missing profile");
  }

  return first;
}

describe("ProfileCatalog", () => {
  it("lists the default profile first and the custom one last", () => {
    const profiles = new ProfileCatalog(memoryStorage()).getSnapshot();

    expect(profiles.length).toBeGreaterThanOrEqual(3);
    expect(profiles[0]?.default).toBe(true);
    expect(profiles.at(-1)?.id).toBe(CUSTOM_PROFILE_ID);
    expect(profiles.filter((profile) => profile.default)).toHaveLength(1);
  });

  it("starts the custom profile from the values of the default one", () => {
    const catalog = new ProfileCatalog(memoryStorage());
    const custom = catalog.getSnapshot().at(-1);
    const { grid, spacing } = firstProfile(catalog);

    expect(custom).toMatchObject({
      id: CUSTOM_PROFILE_ID,
      default: false,
      grid,
      spacing,
    });
  });

  it("publishes a new snapshot and stores the saved custom profile", () => {
    const storage = memoryStorage();
    const catalog = new ProfileCatalog(storage);
    const listener = vi.fn();
    const unsubscribe = catalog.subscribe(listener);
    const before = catalog.getSnapshot();

    const saved = catalog.saveCustom({ ...firstProfile(catalog), grid: 7 });

    expect(saved).toMatchObject({ id: CUSTOM_PROFILE_ID, grid: 7 });
    expect(listener).toHaveBeenCalledOnce();
    expect(catalog.getSnapshot()).not.toBe(before);
    expect(catalog.getSnapshot().at(-1)?.grid).toBe(7);
    expect(storage.getItem(CUSTOM_PROFILE_KEY)).toContain('"grid":7');

    unsubscribe();
    catalog.saveCustom({ ...firstProfile(catalog), grid: 8 });
    expect(listener).toHaveBeenCalledOnce();
  });

  it("forces the custom id on whatever is saved", () => {
    const catalog = new ProfileCatalog(memoryStorage());
    const saved = catalog.saveCustom({
      ...firstProfile(catalog),
      id: "something-else",
      default: true,
    });

    expect(saved.id).toBe(CUSTOM_PROFILE_ID);
    expect(saved.default).toBe(false);
    expect(
      catalog.getSnapshot().filter((profile) => profile.default),
    ).toHaveLength(1);
  });

  it("restores the custom profile saved on a previous visit", () => {
    const storage = memoryStorage();
    const first = new ProfileCatalog(storage);
    first.saveCustom({ ...firstProfile(first), grid: 9 });

    expect(new ProfileCatalog(storage).getSnapshot().at(-1)?.grid).toBe(9);
  });

  it("ignores a damaged stored profile", () => {
    for (const stored of ["not json", JSON.stringify({ id: "x" })]) {
      const catalog = new ProfileCatalog(memoryStorage(stored));

      expect(catalog.getSnapshot().at(-1)?.id).toBe(CUSTOM_PROFILE_ID);
      expect(catalog.getSnapshot().at(-1)?.grid).toBe(
        firstProfile(catalog).grid,
      );
    }
  });

  it("rejects an invalid profile without notifying", () => {
    const catalog = new ProfileCatalog(memoryStorage());
    const listener = vi.fn();
    catalog.subscribe(listener);

    expect(() => catalog.saveCustom({ id: "x" })).toThrow(InvalidProfileError);
    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps working when storage is unavailable", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    const catalog = new ProfileCatalog(broken);

    expect(catalog.saveCustom({ ...firstProfile(catalog), grid: 6 }).grid).toBe(
      6,
    );
  });
});
