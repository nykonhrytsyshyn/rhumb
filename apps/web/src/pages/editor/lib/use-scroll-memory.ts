import { type RefObject, useLayoutEffect, useRef } from "react";

const positions = new Map<string, number>();

function scrollParentOf(element: HTMLElement): HTMLElement | undefined {
  for (
    let parent = element.parentElement;
    parent !== null;
    parent = parent.parentElement
  ) {
    const { overflowY } = getComputedStyle(parent);

    if (overflowY === "auto" || overflowY === "scroll") {
      return parent;
    }
  }

  return undefined;
}

export function scrollToTop(element: HTMLElement | null): void {
  const parent = element === null ? undefined : scrollParentOf(element);

  if (parent !== undefined) {
    parent.scrollTop = 0;
  }
}

export function useScrollMemory(
  key: string,
  ready = true,
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ready) {
      return undefined;
    }

    const element = ref.current;
    const parent = element === null ? undefined : scrollParentOf(element);

    if (parent === undefined) {
      return undefined;
    }

    const restore = (): void => {
      parent.scrollTop = positions.get(key) ?? 0;
    };
    const remember = (): void => {
      positions.set(key, parent.scrollTop);
    };

    restore();

    const frame = requestAnimationFrame(restore);

    parent.addEventListener("scroll", remember, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      parent.removeEventListener("scroll", remember);
    };
  }, [key, ready]);

  return ref;
}
