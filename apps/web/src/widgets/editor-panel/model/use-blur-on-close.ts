import { type RefObject, useEffect } from "react";

export function useBlurOnClose(
  panelRef: RefObject<HTMLElement | null>,
  open: boolean,
): void {
  useEffect(() => {
    if (open) {
      return;
    }

    const panel = panelRef.current;
    const focusedElement = document.activeElement;

    if (
      panel !== null &&
      focusedElement instanceof HTMLElement &&
      panel.contains(focusedElement)
    ) {
      focusedElement.blur();
    }
  }, [panelRef, open]);
}
