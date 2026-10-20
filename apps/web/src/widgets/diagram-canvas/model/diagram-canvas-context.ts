import { type RefObject, createContext } from "react";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

import type { DiagramCanvasState } from "./diagram-canvas-state";

export interface DiagramCanvasContextValue {
  readonly state: DiagramCanvasState;
  readonly transformRef: RefObject<ReactZoomPanPinchRef | null>;
  readonly grid: boolean;
  readonly fullscreen: boolean;
  readonly toggleGrid: () => void;
  readonly toggleFullscreen: () => void;
  readonly zoomIn: () => void;
  readonly zoomOut: () => void;
  readonly fit: () => void;
}

export const DiagramCanvasContext =
  createContext<DiagramCanvasContextValue | null>(null);
