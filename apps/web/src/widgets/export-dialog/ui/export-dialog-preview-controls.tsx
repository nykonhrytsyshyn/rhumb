import type { JSX } from "react";

import {
  IconFocusCentered,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";

import { Button } from "@shared/ui/button";

export interface ExportDialogPreviewLabels {
  readonly zoomIn: string;
  readonly zoomOut: string;
  readonly fit: string;
}

export interface ExportDialogPreviewControlsProps {
  readonly labels: ExportDialogPreviewLabels;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onFit: () => void;
}

export function ExportDialogPreviewControls({
  labels,
  onZoomIn,
  onZoomOut,
  onFit,
}: ExportDialogPreviewControlsProps): JSX.Element {
  const items = [
    { label: labels.fit, icon: <IconFocusCentered />, run: onFit },
    { label: labels.zoomOut, icon: <IconZoomOut />, run: onZoomOut },
    { label: labels.zoomIn, icon: <IconZoomIn />, run: onZoomIn },
  ];

  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
      <div className="flex items-center gap-1 rounded-full border bg-background/40 p-1 backdrop-blur-xl">
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
    </div>
  );
}
