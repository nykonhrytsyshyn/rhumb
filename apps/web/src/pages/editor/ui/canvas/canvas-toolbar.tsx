import type { JSX } from "react";

import {
  IconFocusCentered,
  IconMaximize,
  IconMinimize,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";

export interface CanvasToolbarProps {
  readonly fullscreen: boolean;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onFit: () => void;
  readonly onToggleFullscreen: () => void;
}

export function CanvasToolbar({
  fullscreen,
  onZoomIn,
  onZoomOut,
  onFit,
  onToggleFullscreen,
}: CanvasToolbarProps): JSX.Element {
  const t = useT();
  const items = [
    { label: t("common.canvas.fit"), icon: <IconFocusCentered />, run: onFit },
    {
      label: t("common.canvas.zoomOut"),
      icon: <IconZoomOut />,
      run: onZoomOut,
    },
    { label: t("common.canvas.zoomIn"), icon: <IconZoomIn />, run: onZoomIn },
    {
      label: t("common.canvas.fullscreen"),
      icon: fullscreen ? <IconMinimize /> : <IconMaximize />,
      run: onToggleFullscreen,
    },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border bg-background p-1">
      {items.map((item) => (
        <Button
          key={item.label}
          variant="ghost"
          size="icon-sm"
          aria-label={item.label}
          title={item.label}
          onClick={item.run}
        >
          {item.icon}
        </Button>
      ))}
    </div>
  );
}
