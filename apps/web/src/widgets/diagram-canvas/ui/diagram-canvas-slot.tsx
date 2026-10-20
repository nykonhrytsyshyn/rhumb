import type { JSX, ReactNode } from "react";

import { cn } from "@shared/lib/cn";

import { useDiagramCanvas } from "../model";

export interface DiagramCanvasSlotProps {
  readonly position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  readonly children: ReactNode;
}

export function DiagramCanvasSlot({
  position,
  children,
}: DiagramCanvasSlotProps): JSX.Element {
  const { fullscreen } = useDiagramCanvas();

  const className = {
    "top-left": cn(
      "absolute top-3 left-3 hidden md:block",
      fullscreen && "hidden!",
    ),
    "top-right": "absolute top-3 right-3",
    "bottom-left": cn(
      "absolute left-3 flex items-center gap-2 md:bottom-3",
      fullscreen ? "bottom-3" : "bottom-12",
    ),
    "bottom-right": cn(
      "absolute right-3 flex items-center gap-2 md:bottom-3",
      fullscreen ? "bottom-3" : "bottom-12",
    ),
  }[position];

  return <div className={className}>{children}</div>;
}
