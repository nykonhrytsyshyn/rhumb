import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileRegistry } from "@rhumb/profiles";

import { renderDiagram } from "../api/render-diagram";
import { useRenderedDiagram } from "./use-rendered-diagram";

vi.mock("../api/render-diagram", () => ({ renderDiagram: vi.fn() }));

const profile = (() => {
  const [first] = ProfileRegistry.withBuiltins().list();

  if (first === undefined) {
    throw new Error("Missing profile");
  }

  return first;
})();

const mocked = vi.mocked(renderDiagram);

describe("useRenderedDiagram", () => {
  beforeEach(() => {
    mocked.mockReset();
  });

  it("is pending until the first render completes", async () => {
    mocked.mockResolvedValue({ svg: "<svg/>", size: { width: 10, height: 5 } });

    const { result } = renderHook(() =>
      useRenderedDiagram("a", profile, "beside", 0),
    );

    expect(result.current.pending).toBe(true);
    await waitFor(() => {
      expect(result.current.pending).toBe(false);
    });
    expect(result.current).toMatchObject({ svg: "<svg/>", error: null });
  });

  it("keeps the last drawing and reports the error", async () => {
    mocked.mockResolvedValueOnce({
      svg: "<svg/>",
      size: { width: 1, height: 1 },
    });

    const { result, rerender } = renderHook(
      ({ source }) => useRenderedDiagram(source, profile, "beside", 0),
      { initialProps: { source: "ok" } },
    );

    await waitFor(() => {
      expect(result.current.svg).toBe("<svg/>");
    });

    mocked.mockRejectedValueOnce(new Error("Line 1: boom"));
    rerender({ source: "bad" });
    await waitFor(() => {
      expect(result.current.error).toBe("Line 1: boom");
    });
    expect(result.current.svg).toBe("<svg/>");
    expect(result.current.pending).toBe(false);
  });

  it("describes non-Error failures", async () => {
    mocked.mockRejectedValueOnce("plain");

    const { result } = renderHook(() =>
      useRenderedDiagram("a", profile, "beside", 0),
    );

    await waitFor(() => {
      expect(result.current.error).toBe("plain");
    });
  });

  it("ignores results of superseded renders", async () => {
    interface Result {
      svg: string;
      size: { width: number; height: number };
    }

    let resolveFirst: (value: Result) => void = () => undefined;

    mocked.mockImplementationOnce(
      () =>
        new Promise<Result>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    mocked.mockResolvedValueOnce({
      svg: "<second/>",
      size: { width: 2, height: 2 },
    });

    const { result, rerender } = renderHook(
      ({ source }) => useRenderedDiagram(source, profile, "beside", 0),
      { initialProps: { source: "first" } },
    );

    await waitFor(() => {
      expect(mocked).toHaveBeenCalledTimes(1);
    });

    rerender({ source: "second" });

    await waitFor(() => {
      expect(result.current.svg).toBe("<second/>");
    });

    resolveFirst({ svg: "<first/>", size: { width: 1, height: 1 } });
    await Promise.resolve();
    expect(result.current.svg).toBe("<second/>");
  });

  it("passes the label style on and redraws when it changes", async () => {
    mocked.mockResolvedValue({ svg: "<svg/>", size: { width: 1, height: 1 } });
    const { rerender } = renderHook(
      ({ style }: { style: "beside" | "inline" }) =>
        useRenderedDiagram("a", profile, style, 0),
      { initialProps: { style: "beside" } },
    );
    await waitFor(() => {
      expect(mocked).toHaveBeenLastCalledWith("a", profile, {
        labelStyle: "beside",
      });
    });

    rerender({ style: "inline" });
    await waitFor(() => {
      expect(mocked).toHaveBeenLastCalledWith("a", profile, {
        labelStyle: "inline",
      });
    });
  });

  it("does nothing without a profile", () => {
    const { result } = renderHook(() =>
      useRenderedDiagram("a", undefined, "beside", 0),
    );

    expect(result.current).toEqual({
      svg: null,
      size: null,
      error: null,
      pending: false,
    });
    expect(mocked).not.toHaveBeenCalled();
  });
});
