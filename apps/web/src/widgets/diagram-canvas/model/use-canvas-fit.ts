import { type RefObject, useCallback, useEffect, useRef } from "react";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

import type { Size } from "@rhumb/kernel";

import { FIT_MARGIN, MIN_SCALE } from "./constants";

export interface UseCanvasFitOptions {
  readonly svg: string | null;
  readonly size: Size | null;
  readonly fitKey: string | number;
}

export interface CanvasFit {
  readonly transformRef: RefObject<ReactZoomPanPinchRef | null>;
  readonly fit: () => void;
  readonly zoomIn: () => void;
  readonly zoomOut: () => void;
}

export function useCanvasFit({
  svg,
  size,
  fitKey,
}: UseCanvasFitOptions): CanvasFit {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const pendingFit = useRef(true);

  const fit = useCallback(() => {
    const api = transformRef.current;
    const viewport = api?.instance.wrapperComponent;

    if (
      api === null ||
      viewport === null ||
      viewport === undefined ||
      size === null
    ) {
      return;
    }

    const scale = Math.min(
      1,
      (viewport.clientWidth - FIT_MARGIN) / size.width,
      (viewport.clientHeight - FIT_MARGIN) / size.height,
    );

    void api.centerView(Math.max(scale, MIN_SCALE), 0);
  }, [size]);

  useEffect(() => {
    pendingFit.current = true;
  }, [fitKey]);

  useEffect(() => {
    if (!pendingFit.current || svg === null) {
      return;
    }

    pendingFit.current = false;
    fit();
  }, [svg, fit]);

  const zoomIn = useCallback(() => {
    void transformRef.current?.zoomIn();
  }, []);

  const zoomOut = useCallback(() => {
    void transformRef.current?.zoomOut();
  }, []);

  return { transformRef, fit, zoomIn, zoomOut };
}
