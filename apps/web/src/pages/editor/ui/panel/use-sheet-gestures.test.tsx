import type { PointerEvent, WheelEvent } from "react";

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useSheetGestures } from "./use-sheet-gestures";

function pointer(y: number): PointerEvent {
  return { clientY: y } as PointerEvent;
}

function setup(open: boolean) {
  const onOpenChange = vi.fn();
  const { result } = renderHook(() => useSheetGestures(open, onOpenChange));

  return { handle: result.current, onOpenChange };
}

describe("useSheetGestures", () => {
  it("expands on a swipe up and collapses on a swipe down", () => {
    const { handle, onOpenChange } = setup(false);

    act(() => {
      handle.onPointerDown(pointer(300));
      handle.onPointerUp(pointer(200));
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    act(() => {
      handle.onPointerDown(pointer(200));
      handle.onPointerUp(pointer(300));
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("toggles on a tap", () => {
    const { handle, onOpenChange } = setup(true);

    act(() => {
      handle.onPointerDown(pointer(100));
      handle.onPointerUp(pointer(102));
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("ignores a release without a press and cancelled gestures", () => {
    const { handle, onOpenChange } = setup(false);

    act(() => {
      handle.onPointerUp(pointer(10));
      handle.onPointerDown(pointer(100));
      handle.onPointerCancel();
      handle.onPointerUp(pointer(10));
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("expands on scroll down and collapses on scroll up", () => {
    const { handle, onOpenChange } = setup(false);

    act(() => {
      handle.onWheel({ deltaY: 40 } as WheelEvent);
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    act(() => {
      handle.onWheel({ deltaY: -40 } as WheelEvent);
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    act(() => {
      handle.onWheel({ deltaY: 0 } as WheelEvent);
    });
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });
});
