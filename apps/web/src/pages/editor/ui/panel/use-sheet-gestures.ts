import { type PointerEvent, type WheelEvent, useRef } from "react";

const SWIPE_DISTANCE = 24;

export interface SheetHandleProps {
  readonly onPointerDown: (event: PointerEvent) => void;
  readonly onPointerUp: (event: PointerEvent) => void;
  readonly onPointerCancel: () => void;
  readonly onWheel: (event: WheelEvent) => void;
}

/**
 * Gestures for the bottom sheet handle: swipe up or scroll to expand, swipe
 * down to collapse, tap to toggle.
 */
export function useSheetGestures(
  open: boolean,
  onOpenChange: (open: boolean) => void,
): SheetHandleProps {
  const startY = useRef<number | null>(null);

  return {
    onPointerDown: (event) => {
      startY.current = event.clientY;
    },
    onPointerUp: (event) => {
      if (startY.current === null) {
        return;
      }

      const distance = event.clientY - startY.current;
      startY.current = null;

      onOpenChange(
        distance <= -SWIPE_DISTANCE
          ? true
          : distance >= SWIPE_DISTANCE
            ? false
            : !open,
      );
    },
    onPointerCancel: () => {
      startY.current = null;
    },
    onWheel: (event) => {
      if (event.deltaY > 0) {
        onOpenChange(true);
      } else if (event.deltaY < 0) {
        onOpenChange(false);
      }
    },
  };
}
