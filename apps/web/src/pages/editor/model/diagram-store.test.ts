import { IDBFactory } from "fake-indexeddb";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  IndexedDbDiagramStore,
  type SavedDiagram,
  isSavedDiagram,
  requestPersistentStorage,
} from "./diagram-store";

function diagram(overrides: Partial<SavedDiagram> = {}): SavedDiagram {
  return {
    id: "a",
    name: "First",
    source: "flowchart TD\nA --> B",
    profileId: "iso",
    labelStyle: "beside",
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("IndexedDbDiagramStore", () => {
  it("starts empty", async () => {
    expect(await new IndexedDbDiagramStore(new IDBFactory()).list()).toEqual(
      [],
    );
  });

  it("keeps what is put and lists the newest first", async () => {
    const store = new IndexedDbDiagramStore(new IDBFactory());

    await store.put(diagram({ id: "old", updatedAt: 1 }));
    await store.put(diagram({ id: "new", updatedAt: 3 }));
    await store.put(diagram({ id: "middle", updatedAt: 2 }));

    expect((await store.list()).map((item) => item.id)).toEqual([
      "new",
      "middle",
      "old",
    ]);
  });

  it("replaces a record that has the same id", async () => {
    const store = new IndexedDbDiagramStore(new IDBFactory());

    await store.put(diagram({ name: "Before" }));
    await store.put(diagram({ name: "After", updatedAt: 5 }));

    const items = await store.list();

    expect(items).toHaveLength(1);
    expect(items[0]?.name).toBe("After");
  });

  it("removes a record", async () => {
    const store = new IndexedDbDiagramStore(new IDBFactory());

    await store.put(diagram({ id: "a" }));
    await store.put(diagram({ id: "b" }));
    await store.remove("a");

    expect((await store.list()).map((item) => item.id)).toEqual(["b"]);
  });

  it("is still there for another connection to the same database", async () => {
    const factory = new IDBFactory();

    await new IndexedDbDiagramStore(factory).put(diagram());

    expect(await new IndexedDbDiagramStore(factory).list()).toHaveLength(1);
  });

  it("ignores records that do not look like diagrams", async () => {
    const factory = new IDBFactory();
    const store = new IndexedDbDiagramStore(factory, "mixed");

    await store.put(diagram({ id: "good" }));
    await store.put({ id: "bad", name: 1 } as unknown as SavedDiagram);

    expect((await store.list()).map((item) => item.id)).toEqual(["good"]);
  });

  it("explains when the browser has no storage", async () => {
    const store = new IndexedDbDiagramStore(undefined);

    await expect(store.list()).rejects.toThrow(/not available/);
  });
});

describe("isSavedDiagram", () => {
  it("accepts a complete record and rejects anything else", () => {
    expect(isSavedDiagram(diagram())).toBe(true);
    expect(isSavedDiagram(null)).toBe(false);
    expect(isSavedDiagram("text")).toBe(false);
    expect(isSavedDiagram({ ...diagram(), labelStyle: "sideways" })).toBe(
      false,
    );
    expect(isSavedDiagram({ ...diagram(), createdAt: "yesterday" })).toBe(
      false,
    );
  });
});

describe("requestPersistentStorage", () => {
  it("reports whether the browser agreed", async () => {
    vi.stubGlobal("navigator", {
      storage: { persist: () => Promise.resolve(true) },
    });

    expect(await requestPersistentStorage()).toBe(true);
  });

  it("copes with browsers that cannot persist", async () => {
    vi.stubGlobal("navigator", {});

    expect(await requestPersistentStorage()).toBe(false);
  });
});
