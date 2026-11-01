// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { readField } from "../../lib/profile-form";
import { CUSTOM_PROFILE_ID, ProfileCatalog } from "./profile-catalog";
import { useProfileEditor } from "./use-profile-editor";

function memoryStorage() {
  const data = new Map<string, string>();

  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

afterEach(() => {
  window.localStorage.clear();
});

function setup() {
  const catalog = new ProfileCatalog(memoryStorage());
  const hook = renderHook(() => useProfileEditor(catalog));

  return { catalog, ...hook };
}

describe("useProfileEditor", () => {
  it("starts on the default profile, which cannot be edited", () => {
    const { result } = setup();

    expect(result.current.selected.default).toBe(true);
    expect(result.current.editable).toBe(false);
    expect(result.current.active).toBe(result.current.selected);
    expect(result.current.dirty).toBe(false);
  });

  it("restores the profile chosen on a previous visit", () => {
    window.localStorage.setItem("rhumb:profile", "gost-19.701-90");
    const { result } = renderHook(() =>
      useProfileEditor(new ProfileCatalog(memoryStorage())),
    );

    expect(result.current.selected.id).toBe("gost-19.701-90");
  });

  it("falls back to the default for an unknown stored id", () => {
    window.localStorage.setItem("rhumb:profile", "gone");
    const { result } = renderHook(() =>
      useProfileEditor(new ProfileCatalog(memoryStorage())),
    );

    expect(result.current.selected.default).toBe(true);
  });

  it("lets the custom profile be edited and draws valid edits at once", () => {
    const { result } = setup();

    act(() => {
      result.current.select(CUSTOM_PROFILE_ID);
    });

    expect(result.current.editable).toBe(true);

    act(() => {
      result.current.update("grid", "7");
    });

    expect(readField(result.current.values, "grid")).toBe("7");
    expect(result.current.dirty).toBe(true);
    expect(result.current.active.grid).toBe(7);
    expect(result.current.selected.grid).not.toBe(7);
  });

  it("keeps drawing the last valid version while a field is invalid", () => {
    const { result } = setup();

    act(() => {
      result.current.select(CUSTOM_PROFILE_ID);
    });
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

  it("saves a valid form as the custom profile", () => {
    const { result, catalog } = setup();

    act(() => {
      result.current.select(CUSTOM_PROFILE_ID);
    });
    act(() => {
      result.current.update("grid", "9");
    });
    let saved = false;
    act(() => {
      saved = result.current.save();
    });

    expect(saved).toBe(true);
    expect(catalog.getSnapshot().at(-1)?.grid).toBe(9);
    expect(result.current.selected.grid).toBe(9);
    expect(result.current.dirty).toBe(false);
  });

  it("drops edits on reset", () => {
    const { result } = setup();

    act(() => {
      result.current.select(CUSTOM_PROFILE_ID);
    });
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
    const { result } = setup();

    act(() => {
      result.current.select(CUSTOM_PROFILE_ID);
    });
    act(() => {
      result.current.update("grid", "9");
    });
    act(() => {
      result.current.select(result.current.profiles[0]?.id ?? "");
    });

    expect(result.current.editable).toBe(false);
    expect(result.current.dirty).toBe(false);

    act(() => {
      result.current.select(CUSTOM_PROFILE_ID);
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

  it("imports a profile into the custom slot and selects it", () => {
    const { result } = setup();
    const source = result.current.selected;

    act(() => {
      result.current.importProfile({ ...source, id: "from-file", grid: 11 });
    });

    expect(result.current.selected.id).toBe(CUSTOM_PROFILE_ID);
    expect(result.current.selected.grid).toBe(11);
  });

  it("rejects an invalid imported profile", () => {
    const { result } = setup();

    expect(() => result.current.importProfile({ id: "x" })).toThrow();
  });
});
