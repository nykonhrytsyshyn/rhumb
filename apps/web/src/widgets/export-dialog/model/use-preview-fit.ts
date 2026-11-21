import {
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

import type { Size } from "@rhumb/kernel";

import { computePreviewZoom } from "./compute-preview-zoom";
import { DOUBLE_CLICK_ZOOM_FACTOR, ZOOMED_THRESHOLD } from "./constants";

export interface PreviewFit {
  readonly ready: boolean;
  readonly fitScale: number;
  readonly maxScale: number;
  readonly zoomed: boolean;
  readonly syncZoomed: (scale: number) => void;
  readonly fit: (animationTime?: number) => void;
  readonly zoomIn: () => void;
  readonly zoomOut: () => void;
  readonly toggleZoom: () => void;
}

export function usePreviewFit(
  viewportRef: RefObject<HTMLElement | null>,
  transformRef: RefObject<ReactZoomPanPinchRef | null>,
  page: Size | null,
): PreviewFit {
  const [viewport, setViewport] = useState<Size | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const zoomedRef = useRef(false);
  const scaleRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const element = viewportRef.current;

    if (element === null) {
      return;
    }

    const measure = (): void => {
      const width = element.clientWidth;
      const height = element.clientHeight;

      setViewport((previous) =>
        previous !== null &&
        previous.width === width &&
        previous.height === height
          ? previous
          : { width, height },
      );
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measure);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [viewportRef]);

  const { fitScale, maxScale } = computePreviewZoom(page, viewport);
  const pageWidth = page?.width ?? 0;
  const pageHeight = page?.height ?? 0;

  useLayoutEffect(() => {
    if (viewport === null || pageWidth <= 0 || pageHeight <= 0) {
      return;
    }

    const api = transformRef.current;

    if (api === null) {
      return;
    }

    if (
      !zoomedRef.current ||
      (scaleRef.current !== null && scaleRef.current < fitScale)
    ) {
      zoomedRef.current = false;
      scaleRef.current = fitScale;
      void api.centerView(fitScale, 0);
    }
  }, [transformRef, viewport, pageWidth, pageHeight, fitScale]);

  const syncZoomed = useCallback(
    (scale: number): void => {
      scaleRef.current = scale;
      const next = scale > fitScale * ZOOMED_THRESHOLD;

      if (next !== zoomedRef.current) {
        zoomedRef.current = next;
        setZoomed(next);
      }
    },
    [fitScale],
  );

  const fit = useCallback(
    (animationTime = 200): void => {
      zoomedRef.current = false;
      scaleRef.current = fitScale;
      setZoomed((previous) => (previous ? false : previous));
      void transformRef.current?.centerView(fitScale, animationTime);
    },
    [transformRef, fitScale],
  );

  const zoomIn = useCallback((): void => {
    void transformRef.current?.zoomIn();
  }, [transformRef]);

  const zoomOut = useCallback((): void => {
    void transformRef.current?.zoomOut();
  }, [transformRef]);

  const toggleZoom = useCallback((): void => {
    if (zoomedRef.current) {
      fit(200);
      return;
    }

    const target = Math.min(
      maxScale,
      Math.max(fitScale * DOUBLE_CLICK_ZOOM_FACTOR, 1),
    );
    const step = Math.log(target / fitScale);

    if (step > 0) {
      void transformRef.current?.zoomIn(step, 200);
    }
  }, [transformRef, fit, fitScale, maxScale]);

  return {
    ready: viewport !== null,
    fitScale,
    maxScale,
    zoomed,
    syncZoomed,
    fit,
    zoomIn,
    zoomOut,
    toggleZoom,
  };
}
