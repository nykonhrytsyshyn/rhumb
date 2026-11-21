// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSettingsRoom } from "./use-settings-room";

function placed(areaHeight: number, elementHeight: number): HTMLElement {
  const area = document.createElement("div");
  const element = document.createElement("div");

  Object.defineProperty(area, "clientHeight", { value: areaHeight });
  Object.defineProperty(element, "offsetHeight", { value: elementHeight });
  area.append(element);

  return element;
}

describe("useSettingsRoom", () => {
  it("is true when the rest of the area is tall enough", () => {
    const element = placed(700, 256);
    const { result } = renderHook(() =>
      useSettingsRoom({ current: element }, 240),
    );

    expect(result.current).toBe(true);
  });

  it("is false when the element leaves too little room", () => {
    const element = placed(400, 256);
    const { result } = renderHook(() =>
      useSettingsRoom({ current: element }, 240),
    );

    expect(result.current).toBe(false);
  });

  it("is false without an element", () => {
    const { result } = renderHook(() =>
      useSettingsRoom({ current: null }, 240),
    );

    expect(result.current).toBe(false);
  });
});
