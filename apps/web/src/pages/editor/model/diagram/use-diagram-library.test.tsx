// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { SavedDiagram } from "./is-saved-diagram";
import { MemoryDiagramStore } from "./memory-diagram-store";
import { useDiagramLibrary } from "./use-diagram-library";

vi.mock("./request-persistent-storage", () => ({
  requestPersistentStorage: vi.fn(() => Promise.resolve(true)),
}));

function saved(id: string, updatedAt: number): SavedDiagram {
  return {
    id,
    name: id,
    source: "flowchart TD\nA --> B",
    profileId: "iso",
    createdAt: updatedAt,
    updatedAt,
  };
}

function setup(store = new MemoryDiagramStore([saved("a", 1), saved("b", 2)])) {
  let clock = 100;
  let counter = 0;
  const hook = renderHook(() =>
    useDiagramLibrary(
      store,
      () => (clock += 1),
      () => `id-${String((counter += 1))}`,
    ),
  );

  return { store, ...hook };
}

const input = {
  name: "New",
  source: "flowchart LR\nX --> Y",
  profileId: "gost",
};

describe("useDiagramLibrary", () => {
  it("loads the saved diagrams, newest first", async () => {
    const { result } = setup();

    expect(result.current.items).toBeUndefined();

    await waitFor(() => {
      expect(result.current.items?.map((item) => item.id)).toEqual(["b", "a"]);
    });
  });

  it("creates a diagram and puts it first", async () => {
    const { result, store } = setup();

    await waitFor(() => {
      expect(result.current.items).toBeDefined();
    });

    let created: SavedDiagram | undefined;
    await act(async () => {
      created = await result.current.create(input);
    });

    expect(created).toMatchObject({ ...input, id: "id-1" });
    expect(result.current.items?.[0]?.id).toBe("id-1");
    expect((await store.list())[0]?.id).toBe("id-1");
  });

  it("updates a diagram and moves it to the top", async () => {
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.items).toBeDefined();
    });
    await act(async () => {
      await result.current.update("a", { name: "Renamed", source: "x" });
    });

    expect(result.current.items?.[0]).toMatchObject({
      id: "a",
      name: "Renamed",
      source: "x",
      createdAt: 1,
    });
    expect(result.current.items?.[0]?.updatedAt).toBeGreaterThan(2);
  });

  it("does nothing for a diagram that is gone", async () => {
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.items).toBeDefined();
    });

    let updated: SavedDiagram | undefined;
    let copied: SavedDiagram | undefined;
    await act(async () => {
      updated = await result.current.update("missing", { name: "x" });
      copied = await result.current.duplicate("missing", "x");
    });

    expect(updated).toBeUndefined();
    expect(copied).toBeUndefined();
  });

  it("duplicates a diagram under a new id and name", async () => {
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.items).toBeDefined();
    });
    await act(async () => {
      await result.current.duplicate("a", "A (copy)");
    });

    expect(result.current.items).toHaveLength(3);
    expect(result.current.items?.[0]).toMatchObject({
      id: "id-1",
      name: "A (copy)",
      source: saved("a", 1).source,
    });
  });

  it("removes a diagram", async () => {
    const { result, store } = setup();

    await waitFor(() => {
      expect(result.current.items).toBeDefined();
    });

    let removed = false;
    await act(async () => {
      removed = await result.current.remove("a");
    });

    expect(removed).toBe(true);
    expect(result.current.items?.map((item) => item.id)).toEqual(["b"]);
    expect(await store.list()).toHaveLength(1);
  });

  it("removes many diagrams at once", async () => {
    const { result, store } = setup(
      new MemoryDiagramStore([saved("a", 1), saved("b", 2), saved("c", 3)]),
    );

    await waitFor(() => {
      expect(result.current.items).toBeDefined();
    });

    let removed: readonly string[] = [];
    await act(async () => {
      removed = await result.current.removeMany(["a", "c"]);
    });

    expect(removed).toEqual(["a", "c"]);
    expect(result.current.items?.map((item) => item.id)).toEqual(["b"]);
    expect(await store.list()).toHaveLength(1);
  });

  it("reports the diagrams that could not be removed", async () => {
    const store = new MemoryDiagramStore([saved("a", 1), saved("b", 2)]);
    const remove = store.remove.bind(store);
    vi.spyOn(store, "remove").mockImplementation((id) =>
      id === "a" ? Promise.reject(new Error("locked")) : remove(id),
    );
    const { result } = setup(store);

    await waitFor(() => {
      expect(result.current.items).toBeDefined();
    });

    let removed: readonly string[] = [];
    await act(async () => {
      removed = await result.current.removeMany(["a", "b"]);
    });

    expect(removed).toEqual(["b"]);
    expect(result.current.items?.map((item) => item.id)).toEqual(["a"]);
    expect(result.current.error).toBe("locked");
  });

  it("moves the diagrams of one standard to another and keeps their dates", async () => {
    const { result, store } = setup(
      new MemoryDiagramStore([
        { ...saved("a", 1), profileId: "mine" },
        { ...saved("b", 2), profileId: "iso" },
        { ...saved("c", 3), profileId: "mine" },
      ]),
    );

    await waitFor(() => {
      expect(result.current.items).toBeDefined();
    });

    let done = false;
    await act(async () => {
      done = await result.current.reassignProfile("mine", "gost");
    });

    expect(done).toBe(true);
    expect(
      result.current.items?.map((item) => [item.id, item.profileId]),
    ).toEqual([
      ["c", "gost"],
      ["b", "iso"],
      ["a", "gost"],
    ]);
    expect((await store.list()).map((item) => item.updatedAt)).toEqual([
      3, 2, 1,
    ]);
  });

  it("succeeds at once when no diagram uses the standard", async () => {
    const { result, store } = setup();
    const put = vi.spyOn(store, "put");

    await waitFor(() => {
      expect(result.current.items).toBeDefined();
    });

    let done = false;
    await act(async () => {
      done = await result.current.reassignProfile("unused", "gost");
    });

    expect(done).toBe(true);
    expect(put).not.toHaveBeenCalled();
  });

  it("reports the diagrams that could not be moved", async () => {
    const store = new MemoryDiagramStore([
      { ...saved("a", 1), profileId: "mine" },
      { ...saved("b", 2), profileId: "mine" },
    ]);
    const put = store.put.bind(store);
    vi.spyOn(store, "put").mockImplementation((diagram) =>
      diagram.id === "a" ? Promise.reject(new Error("locked")) : put(diagram),
    );
    const { result } = setup(store);

    await waitFor(() => {
      expect(result.current.items).toBeDefined();
    });

    let done = true;
    await act(async () => {
      done = await result.current.reassignProfile("mine", "gost");
    });

    expect(done).toBe(false);
    expect(
      result.current.items?.map((item) => [item.id, item.profileId]),
    ).toEqual([
      ["b", "gost"],
      ["a", "mine"],
    ]);
    expect(result.current.error).toBe("locked");
  });

  it("reports storage failures instead of throwing", async () => {
    const { result } = setup(
      new MemoryDiagramStore([], new Error("storage is full")),
    );

    await waitFor(() => {
      expect(result.current.error).toBe("storage is full");
    });
    expect(result.current.items).toEqual([]);

    let created: SavedDiagram | undefined = saved("x", 1);
    let removed = true;
    await act(async () => {
      created = await result.current.create(input);
      removed = await result.current.remove("a");
    });

    expect(created).toBeUndefined();
    expect(removed).toBe(false);
    expect(result.current.error).toBe("storage is full");
  });

  it("describes failures that are not errors", async () => {
    const store = new MemoryDiagramStore();
    vi.spyOn(store, "list").mockRejectedValueOnce("plain");
    const { result } = setup(store);

    await waitFor(() => {
      expect(result.current.error).toBe("plain");
    });
  });
});
