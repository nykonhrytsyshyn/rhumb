import { describe, expect, it, vi } from "vitest";

import { LanguageStore, resolvePreferredLanguage } from "./language-store";

function memoryStorage(initial?: string) {
  const data = new Map<string, string>();

  if (initial !== undefined) {
    data.set("language", initial);
  }

  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

describe("resolvePreferredLanguage", () => {
  it("prefers a valid stored language", () => {
    expect(resolvePreferredLanguage("uk", ["en-US"])).toBe("uk");
  });

  it("ignores an unsupported stored language", () => {
    expect(resolvePreferredLanguage("xx", ["uk-UA"])).toBe("uk");
  });

  it("matches browser languages by their primary tag", () => {
    expect(resolvePreferredLanguage(null, ["de", "uk-UA", "en"])).toBe("uk");
  });

  it("uses English when nothing matches", () => {
    expect(resolvePreferredLanguage(null, ["de", "fr"])).toBe("en");
    expect(resolvePreferredLanguage(null, [])).toBe("en");
  });
});

describe("LanguageStore", () => {
  it("starts from storage, then browser, and sets the page language", () => {
    const root = document.createElement("html");

    expect(new LanguageStore(memoryStorage("uk"), [], root).getSnapshot()).toBe(
      "uk",
    );
    expect(root.lang).toBe("uk");
    expect(new LanguageStore(memoryStorage(), ["uk"], root).getSnapshot()).toBe(
      "uk",
    );
  });

  it("stores the new language and notifies subscribers once", () => {
    const storage = memoryStorage();
    const root = document.createElement("html");
    const store = new LanguageStore(storage, [], root);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.set("uk");
    store.set("uk");

    expect(listener).toHaveBeenCalledOnce();
    expect(storage.getItem("language")).toBe("uk");
    expect(root.lang).toBe("uk");

    unsubscribe();
    store.set("en");
    expect(listener).toHaveBeenCalledOnce();
  });

  it("survives unavailable storage", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    const store = new LanguageStore(
      broken,
      ["uk"],
      document.createElement("html"),
    );

    expect(store.getSnapshot()).toBe("uk");
    store.set("en");
    expect(store.getSnapshot()).toBe("en");
  });
});
