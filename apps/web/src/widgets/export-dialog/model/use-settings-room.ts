import { type RefObject, useLayoutEffect, useState } from "react";

/**
 * Tells whether the area that holds `ref` is tall enough to keep the element
 * in view and still leave `minRoom` pixels for the rest of its content.
 */
export function useSettingsRoom(
  ref: RefObject<HTMLElement | null>,
  minRoom: number,
): boolean {
  const [roomy, setRoomy] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    const area = element?.parentElement;

    if (element === null || area === null || area === undefined) {
      return;
    }

    const measure = (): void => {
      setRoomy(area.clientHeight - element.offsetHeight >= minRoom);
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measure);

    observer.observe(area);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, minRoom]);

  return roomy;
}
