import { useContext } from "react";

import {
  DiagramCanvasContext,
  type DiagramCanvasContextValue,
} from "./diagram-canvas-context";

export function useDiagramCanvas(): DiagramCanvasContextValue {
  const context = useContext(DiagramCanvasContext);

  if (context === null) {
    throw new Error(
      "DiagramCanvas components must be used within <DiagramCanvas>",
    );
  }

  return context;
}
