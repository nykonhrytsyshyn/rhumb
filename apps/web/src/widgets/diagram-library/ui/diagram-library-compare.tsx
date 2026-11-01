import { type JSX, type KeyboardEvent, useRef, useState } from "react";

import { IconAlertTriangle, IconArrowsHorizontal } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Badge } from "@shared/ui/badge";
import { Spinner } from "@shared/ui/spinner";

import {
  DiagramLibraryCompareLayer,
  type DiagramLibraryCompareSide,
} from "./diagram-library-compare-layer";

export interface DiagramLibraryCompareProps {
  readonly before: DiagramLibraryCompareSide;
  readonly after: DiagramLibraryCompareSide;
}

const STEP = 5;
const BIG_STEP = 20;

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function DiagramLibraryCompare({
  before,
  after,
}: DiagramLibraryCompareProps): JSX.Element {
  const t = useT();
  const frameRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const sizes = [before.size, after.size].filter((size) => size !== null);
  const canvas = {
    width: Math.max(1, ...sizes.map((size) => size.width)),
    height: Math.max(1, ...sizes.map((size) => size.height)),
  };
  const failed = before.failed || after.failed;
  const ready = before.svg !== null && after.svg !== null;

  function moveTo(clientX: number): void {
    const frame = frameRef.current;

    if (frame === null) {
      return;
    }

    const rect = frame.getBoundingClientRect();

    if (rect.width > 0) {
      setPosition(clamp(((clientX - rect.left) / rect.width) * 100));
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const step = event.shiftKey ? BIG_STEP : STEP;
    const next =
      event.key === "ArrowLeft"
        ? position - step
        : event.key === "ArrowRight"
          ? position + step
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? 100
              : undefined;

    if (next !== undefined) {
      event.preventDefault();
      setPosition(clamp(next));
    }
  }

  return (
    <div
      ref={frameRef}
      data-dragging={dragging}
      className="relative h-64 touch-none overflow-hidden border-y bg-card bg-drafting-grid select-none data-[dragging=true]:cursor-grabbing sm:h-80"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        moveTo(event.clientX);
      }}
      onPointerMove={(event) => {
        if (dragging) {
          moveTo(event.clientX);
        }
      }}
      onPointerUp={() => {
        setDragging(false);
      }}
      onPointerCancel={() => {
        setDragging(false);
      }}
    >
      <DiagramLibraryCompareLayer
        side={before}
        canvas={canvas}
        from={0}
        to={position}
      />
      <DiagramLibraryCompareLayer
        side={after}
        canvas={canvas}
        from={position}
        to={100}
      />

      {ready ? null : (
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-muted-foreground">
          {failed ? (
            <span className="flex items-center gap-1">
              <IconAlertTriangle className="size-4" />
              {t("editor.library.previewFailed")}
            </span>
          ) : (
            <Spinner />
          )}
        </div>
      )}

      <Badge variant="secondary" className="absolute top-2 left-2">
        {before.label}
      </Badge>
      <Badge variant="secondary" className="absolute top-2 right-2">
        {after.label}
      </Badge>

      {/* Divider */}
      <div
        role="slider"
        tabIndex={0}
        aria-label={t("editor.library.updateDialog.slider")}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={t("editor.library.updateDialog.sliderValue", {
          saved: Math.round(position),
          current: Math.round(100 - position),
        })}
        className="group absolute inset-y-0 w-8 -translate-x-1/2 cursor-grab outline-none data-[dragging=true]:cursor-grabbing"
        style={{ left: `${String(position)}%` }}
        onKeyDown={onKeyDown}
      >
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />

        <span className="absolute top-1/2 left-1/2 flex size-8 -translate-1/2 items-center justify-center rounded-full border bg-transparent shadow-sm backdrop-blur-md transition-shadow group-focus-visible:border-ring group-focus-visible:ring-3 group-focus-visible:ring-ring/30">
          <IconArrowsHorizontal className="size-4" />
        </span>
      </div>
    </div>
  );
}
