import { type JSX, type ReactNode, useMemo, useState } from "react";

import { cn } from "@shared/lib/cn";

import {
  DiagramCanvasContext,
  type DiagramCanvasState,
  useCanvasFit,
  useFullscreen,
} from "../model";

export interface DiagramCanvasShellProps {
  readonly state: DiagramCanvasState;
  readonly fitKey: string | number;
  readonly children: ReactNode;
}

export function DiagramCanvasShell({
  state,
  fitKey,
  children,
}: DiagramCanvasShellProps): JSX.Element {
  const [grid, setGrid] = useState(true);
  const { rootRef, fullscreen, toggleFullscreen } = useFullscreen();
  const { transformRef, fit, zoomIn, zoomOut } = useCanvasFit({
    svg: state.svg,
    size: state.size,
    fitKey,
  });

  const value = useMemo(
    () => ({
      state,
      transformRef,
      grid,
      fullscreen,
      toggleGrid: () => {
        setGrid((current) => !current);
      },
      toggleFullscreen,
      zoomIn,
      zoomOut,
      fit,
    }),
    [
      state,
      transformRef,
      grid,
      fullscreen,
      toggleFullscreen,
      zoomIn,
      zoomOut,
      fit,
    ],
  );

  return (
    <DiagramCanvasContext.Provider value={value}>
      <div
        ref={rootRef}
        className={cn(
          "relative h-full min-w-0 flex-1 overflow-hidden text-foreground backdrop:bg-background",
          grid && "bg-drafting-grid",
        )}
      >
        {children}
      </div>
    </DiagramCanvasContext.Provider>
  );
}
