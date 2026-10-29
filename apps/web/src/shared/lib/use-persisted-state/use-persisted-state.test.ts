// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePersistedState } from "./use-persisted-state";

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("usePersistedState", () => {
  it("starts with the fallback when nothing is stored", () => {
    const { result } = renderHook(() => usePersistedState("k", "fallback"));

    expect(result.current[0]).toBe("fallback");
  });

  it("restores a stored value and stores updates", () => {
    window.localStorage.setItem("k", "saved");
    const { result } = renderHook(() => usePersistedState("k", "fallback"));

    expect(result.current[0]).toBe("saved");

    act(() => {
      result.current[1]("next");
    });
    expect(result.current[0]).toBe("next");
    expect(window.localStorage.getItem("k")).toBe("next");
  });

  it("keeps working when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });

    const { result } = renderHook(() => usePersistedState("k", "fallback"));

    expect(result.current[0]).toBe("fallback");
    act(() => {
      result.current[1]("next");
    });
    expect(result.current[0]).toBe("next");
  });
});
