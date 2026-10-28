import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { DOCS_DEFAULT_OPEN } from "../config/docs-sections";
import { DOCS_OPEN_KEY } from "../config/storage-keys";
import { parseOpenSections, useDocsState } from "./use-docs-state";

beforeEach(() => {
  window.localStorage.clear();
});

describe("parseOpenSections", () => {
  it("keeps the sections it knows", () => {
    expect(parseOpenSections('["lines","nope","blocks"]')).toEqual([
      "lines",
      "blocks",
    ]);
  });

  it("falls back to the default for anything unreadable", () => {
    expect(parseOpenSections("{")).toEqual(DOCS_DEFAULT_OPEN);
    expect(parseOpenSections('{"a":1}')).toEqual(DOCS_DEFAULT_OPEN);
  });
});

describe("useDocsState", () => {
  it("opens the default sections the first time", () => {
    const { result } = renderHook(() => useDocsState());

    expect(result.current.open).toEqual(DOCS_DEFAULT_OPEN);
  });

  it("is the same after the tab is left and shown again", () => {
    const first = renderHook(() => useDocsState());

    act(() => {
      first.result.current.setOpen(["lines", "frames"]);
    });
    first.unmount();

    const second = renderHook(() => useDocsState());

    expect(second.result.current.open).toEqual(["lines", "frames"]);
    expect(window.localStorage.getItem(DOCS_OPEN_KEY)).toBe(
      '["lines","frames"]',
    );
  });

  it("drops what is not a section", () => {
    const { result } = renderHook(() => useDocsState());

    act(() => {
      result.current.setOpen(["blocks", "other"]);
    });

    expect(result.current.open).toEqual(["blocks"]);
  });
});
