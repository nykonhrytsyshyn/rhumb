import type { JSX } from "react";

import {
  IconFocusCentered,
  IconPin,
  IconPinnedFilled,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";

import { Button } from "@shared/ui/button";

export interface ExportDialogPreviewLabels {
  readonly zoomIn: string;
  readonly zoomOut: string;
  readonly fit: string;
  readonly pin: string;
  readonly unpin: string;
}

export interface ExportDialogPreviewControlsProps {
  readonly labels: ExportDialogPreviewLabels;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onFit: () => void;
  readonly pin: {
    readonly pinned: boolean;
    readonly onToggle: () => void;
  } | null;
}

export function ExportDialogPreviewControls({
  labels,
  onZoomIn,
  onZoomOut,
  onFit,
  pin,
}: ExportDialogPreviewControlsProps): JSX.Element {
  const items = [
    { label: labels.fit, icon: <IconFocusCentered />, run: onFit },
    { label: labels.zoomOut, icon: <IconZoomOut />, run: onZoomOut },
    { label: labels.zoomIn, icon: <IconZoomIn />, run: onZoomIn },
  ];

  return (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-1 md:top-3 md:right-3">
      {pin === null ? null : (
        <Button
          variant="outline"
          size="icon"
          aria-pressed={pin.pinned}
          aria-label={pin.pinned ? labels.unpin : labels.pin}
          title={pin.pinned ? labels.unpin : labels.pin}
          onClick={pin.onToggle}
          className="bg-background/40 bg-clip-border p-1 shadow-xs backdrop-blur-xl md:hidden"
        >
          {pin.pinned ? <IconPinnedFilled /> : <IconPin />}
        </Button>
      )}

      <div className="flex items-center gap-1 rounded-full border bg-background/40 backdrop-blur-xl">
        {items.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="icon"
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
