import type { JSX } from "react";

import { DiagramCanvasAlert } from "./diagram-canvas-alert";
import { DiagramCanvasEmpty } from "./diagram-canvas-empty";
import { DiagramCanvasGridToggle } from "./diagram-canvas-grid-toggle";
import { DiagramCanvasPendingBadge } from "./diagram-canvas-pending-badge";
import {
  DiagramCanvasShell,
  type DiagramCanvasShellProps,
} from "./diagram-canvas-shell";
import { DiagramCanvasSlot } from "./diagram-canvas-slot";
import { DiagramCanvasToolbar } from "./diagram-canvas-toolbar";
import { DiagramCanvasViewport } from "./diagram-canvas-viewport";

interface DiagramCanvasComponent {
  (props: DiagramCanvasShellProps): JSX.Element;
  Viewport: typeof DiagramCanvasViewport;
  Empty: typeof DiagramCanvasEmpty;
  Slot: typeof DiagramCanvasSlot;
  Toolbar: typeof DiagramCanvasToolbar;
  Alert: typeof DiagramCanvasAlert;
  GridToggle: typeof DiagramCanvasGridToggle;
  PendingBadge: typeof DiagramCanvasPendingBadge;
}

export const DiagramCanvas: DiagramCanvasComponent = Object.assign(
  DiagramCanvasShell,
  {
    Viewport: DiagramCanvasViewport,
    Empty: DiagramCanvasEmpty,
    Slot: DiagramCanvasSlot,
    Toolbar: DiagramCanvasToolbar,
    Alert: DiagramCanvasAlert,
    GridToggle: DiagramCanvasGridToggle,
    PendingBadge: DiagramCanvasPendingBadge,
  },
);
