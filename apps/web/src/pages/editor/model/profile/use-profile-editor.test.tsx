// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { readField } from "../../lib/profile-form";
import { ProfileCatalog } from "./profile-catalog";
import { useProfileEditor } from "./use-profile-editor";

function memoryStorage() {
  const data = new Map<string, string>();

  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

function newCatalog(): ProfileCatalog {
  let counter = 0;

  return new ProfileCatalog(
    memoryStorage(),
    () => `custom-${String((counter += 1))}`,
  );
}

afterEach(() => {
  window.localStorage.clear();
});

function setup() {
  const catalog = newCatalog();
  const hook = renderHook(() => useProfileEditor(catalog));

  return { catalog, ...hook };
}

/** An editor that already has one custom standard, selected. */
function setupWithCustom() {
  const made = setup();

  act(() => {
    made.result.current.create("Mine", made.result.current.selected.id);
  });

  return made;
}

describe("useProfileEditor", () => {
  it("starts on the default profile, which cannot be edited", () => {
    const { result } = setup();

    expect(result.current.selected.default).toBe(true);
    expect(result.current.editable).toBe(false);
    expect(result.current.active).toBe(result.current.selected);
    expect(result.current.dirty).toBe(false);
    expect(result.current.custom).toEqual([]);
  });

  it("restores the profile chosen on a previous visit", () => {
    window.localStorage.setItem("rhumb:profile", "gost-19.701-90");
    const { result } = renderHook(() => useProfileEditor(newCatalog()));

    expect(result.current.selected.id).toBe("gost-19.701-90");
  });

  it("falls back to the default for an unknown stored id", () => {
    window.localStorage.setItem("rhumb:profile", "gone");
    const { result } = renderHook(() => useProfileEditor(newCatalog()));

    expect(result.current.selected.default).toBe(true);
  });

  it("creates a custom standard, switches to it and lets it be edited", () => {
    const { result } = setupWithCustom();

    expect(result.current.selected).toMatchObject({
      id: "custom-1",
      title: "Mine",
    });
    expect(result.current.editable).toBe(true);
    expect(result.current.custom).toHaveLength(1);
  });

  it("draws valid edits at once", () => {
    const { result } = setupWithCustom();

    act(() => {
      result.current.update("grid", "7");
    });

    expect(readField(result.current.values, "grid")).toBe("7");
    expect(result.current.dirty).toBe(true);
    expect(result.current.active.grid).toBe(7);
    expect(result.current.selected.grid).not.toBe(7);
  });

  it("keeps drawing the last valid version while a field is invalid", () => {
    const { result } = setupWithCustom();

    act(() => {
      result.current.update("grid", "7");
    });
    act(() => {
      result.current.update("grid", "abc");
    });

    expect(result.current.parsed.errors.get("grid")).toBe(
      "editor.config.errors.number",
    );
    expect(result.current.active.grid).toBe(7);
    expect(result.current.save()).toBe(false);
  });

  it("saves a valid form into the selected custom standard only", () => {
    const { result, catalog } = setupWithCustom();

    act(() => {
      result.current.create("Other", result.current.selected.id);
    });
    act(() => {
      result.current.update("grid", "9");
    });
    let saved = false;
    act(() => {
      saved = result.current.save();
    });

    const [mine, other] = catalog.getSnapshot().custom;

    expect(saved).toBe(true);
    expect(other?.grid).toBe(9);
    expect(mine?.grid).not.toBe(9);
    expect(result.current.selected.grid).toBe(9);
    expect(result.current.dirty).toBe(false);
  });

  it("drops edits on reset", () => {
    const { result } = setupWithCustom();

    act(() => {
      result.current.update("grid", "9");
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.dirty).toBe(false);
    expect(result.current.active.grid).not.toBe(9);
  });

  it("keeps unsaved edits while another standard is looked at", () => {
    const { result } = setupWithCustom();

    act(() => {
      result.current.update("grid", "9");
    });
    act(() => {
      result.current.select(result.current.builtIn[0]?.id ?? "");
    });

    expect(result.current.editable).toBe(false);
    expect(result.current.dirty).toBe(false);

    act(() => {
      result.current.select("custom-1");
    });

    expect(result.current.dirty).toBe(true);
    expect(result.current.active.grid).toBe(9);
  });

  it("refuses to save while a built-in standard is selected", () => {
    const { result } = setup();
    let saved = true;

    act(() => {
      saved = result.current.save();
    });

    expect(saved).toBe(false);
  });

  it("starts a copy of the selected standard from what is drawn, saved or not", () => {
    const { result } = setupWithCustom();

    act(() => {
      result.current.update("grid", "9");
    });
    act(() => {
      result.current.create("Copy", result.current.selected.id);
    });

    expect(result.current.selected.title).toBe("Copy");
    expect(result.current.selected.grid).toBe(9);
    expect(result.current.dirty).toBe(false);
  });

  it("starts a copy of another standard from its saved version", () => {
    const { result } = setupWithCustom();

    act(() => {
      result.current.update("grid", "9");
    });
    act(() => {
      result.current.create("Copy", result.current.builtIn[0]?.id ?? "");
    });

    expect(result.current.selected.grid).toBe(result.current.builtIn[0]?.grid);
  });

  it("renames the selected standard and keeps its unsaved edits", () => {
    const { result } = setupWithCustom();

    act(() => {
      result.current.update("grid", "9");
    });
    act(() => {
      result.current.rename("Better name");
    });

    expect(result.current.selected.title).toBe("Better name");
    expect(result.current.dirty).toBe(true);
    expect(result.current.active.grid).toBe(9);
    expect(result.current.active.title).toBe("Better name");
  });

  it("falls back to the replacement when the selected standard is removed", () => {
    const { result } = setupWithCustom();
    const replacement = result.current.builtIn[1]?.id ?? "";

    act(() => {
      result.current.remove("custom-1", replacement);
    });

    expect(result.current.custom).toEqual([]);
    expect(result.current.selected.id).toBe(replacement);
  });

  it("stays on the selected standard when another one is removed", () => {
    const { result } = setupWithCustom();

    act(() => {
      result.current.create("Second", result.current.selected.id);
    });
    act(() => {
      result.current.remove("custom-1", result.current.builtIn[0]?.id ?? "");
    });

    expect(result.current.selected.id).toBe("custom-2");
  });

  it("imports a profile as a new custom standard and selects it", () => {
    const { result } = setup();
    const source = result.current.selected;

    act(() => {
      result.current.importProfile({ ...source, id: "from-file", grid: 11 });
    });

    expect(result.current.selected.id).toBe("custom-1");
    expect(result.current.selected.grid).toBe(11);
    expect(result.current.editable).toBe(true);
  });

  it("rejects an invalid imported profile", () => {
    const { result } = setup();

    expect(() => result.current.importProfile({ id: "x" })).toThrow();
  });
});
