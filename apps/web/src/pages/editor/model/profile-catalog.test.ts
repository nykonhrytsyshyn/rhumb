import { describe, expect, it, vi } from "vitest";

import { InvalidProfileError } from "@rhumb/profiles";

import { ProfileCatalog } from "./profile-catalog";

describe("ProfileCatalog", () => {
  it("starts with the built-in profiles", () => {
    expect(new ProfileCatalog().getSnapshot().length).toBeGreaterThanOrEqual(2);
  });

  it("publishes a new snapshot when a profile is registered", () => {
    const catalog = new ProfileCatalog();
    const [first] = catalog.getSnapshot();

    if (first === undefined) {
      throw new Error("Missing profile");
    }

    const listener = vi.fn();
    const unsubscribe = catalog.subscribe(listener);
    const before = catalog.getSnapshot();

    catalog.register({ ...first, id: "custom", title: "Custom" });

    expect(listener).toHaveBeenCalledOnce();
    expect(catalog.getSnapshot()).not.toBe(before);
    expect(catalog.getSnapshot().map((profile) => profile.id)).toContain(
      "custom",
    );

    unsubscribe();
    catalog.register({ ...first, id: "custom-2", title: "Custom 2" });
    expect(listener).toHaveBeenCalledOnce();
  });

  it("rejects an invalid profile without notifying", () => {
    const catalog = new ProfileCatalog();
    const listener = vi.fn();

    catalog.subscribe(listener);
    expect(() => catalog.register({ id: "x" })).toThrow(InvalidProfileError);
    expect(listener).not.toHaveBeenCalled();
  });
});
