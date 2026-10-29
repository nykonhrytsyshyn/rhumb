// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDeveloperMode } from "./use-developer-mode";

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllEnvs();
});

describe("useDeveloperMode", () => {
  it("is off until it is turned on", () => {
    const { result } = renderHook(() => useDeveloperMode());

    expect(result.current.enabled).toBe(false);
    expect(result.current.locked).toBe(false);
  });

  it("stays on after a reload once it has been turned on", () => {
    const first = renderHook(() => useDeveloperMode());

    act(() => {
      first.result.current.setEnabled(true);
    });

    expect(first.result.current.enabled).toBe(true);
    expect(renderHook(() => useDeveloperMode()).result.current.enabled).toBe(
      true,
    );

    act(() => {
      first.result.current.setEnabled(false);
    });

    expect(renderHook(() => useDeveloperMode()).result.current.enabled).toBe(
      false,
    );
  });

  it("is always on, and locked, in the development build", () => {
    vi.stubEnv("NODE_ENV", "development");
    const { result } = renderHook(() => useDeveloperMode());

    expect(result.current).toMatchObject({ enabled: true, locked: true });
  });
});
