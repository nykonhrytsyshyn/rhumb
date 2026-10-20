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

import { useDiagramCanvas } from "../model";

export function DiagramCanvasToolbar(): JSX.Element {
  const t = useT();
  const { fullscreen, fit, zoomIn, zoomOut, toggleFullscreen } =
    useDiagramCanvas();

  const items = [
    { label: t("common.canvas.fit"), icon: <IconFocusCentered />, run: fit },
    {
      label: t("common.canvas.zoomOut"),
      icon: <IconZoomOut />,
      run: zoomOut,
    },
    { label: t("common.canvas.zoomIn"), icon: <IconZoomIn />, run: zoomIn },
    {
      label: t("common.canvas.fullscreen"),
      icon: fullscreen ? <IconMinimize /> : <IconMaximize />,
      run: toggleFullscreen,
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
