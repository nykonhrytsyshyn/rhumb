import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export interface Fullscreen {
  readonly rootRef: RefObject<HTMLDivElement | null>;
  readonly fullscreen: boolean;
  readonly toggleFullscreen: () => void;
}

export function useFullscreen(): Fullscreen {
  const rootRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = (): void => {
      setFullscreen(document.fullscreenElement === rootRef.current);
    };

    document.addEventListener("fullscreenchange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const request =
      document.fullscreenElement === null
        ? rootRef.current?.requestFullscreen()
        : document.exitFullscreen();

    request?.catch(() => undefined);
  }, []);

  return { rootRef, fullscreen, toggleFullscreen };
}
