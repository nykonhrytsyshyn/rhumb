import { type JSX, type ReactNode, useId, useRef } from "react";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

import { IconAlertTriangle } from "@tabler/icons-react";

import { cn } from "@shared/lib/cn";
import { usePersistedState } from "@shared/lib/use-persisted-state";
import { Badge } from "@shared/ui/badge";
import { Spinner } from "@shared/ui/spinner";

import { MIN_SETTINGS_ROOM, PIN_STORAGE_KEY, useSettingsRoom } from "../model";
import {
  ExportDialogPreviewControls,
  type ExportDialogPreviewLabels,
} from "./export-dialog-preview-controls";
import { ExportDialogPreviewPage } from "./export-dialog-preview-page";

export type { ExportDialogPreviewLabels };

export interface ExportDialogPreviewProps {
  /** The drawing as the editor shows it: lines follow `color`, blocks `--card`. */
  readonly svg: string | null;
  readonly size: { readonly width: number; readonly height: number } | null;
  /** True while the drawing is still being prepared. */
  readonly pending: boolean;
  /** Text for when there is no drawing to export. */
  readonly empty: string;
  readonly padding: number;
  readonly radius: number;
  /** Page colour, or null for a see-through page. */
  readonly background: string | null;
  readonly ink: string;
  /** Block colour, or `none` for hollow blocks. */
  readonly fill: string;
  /** Backdrop of labels that sit on lines. */
  readonly labelBackground: string;
  /** Name of the format and density, such as `PNG · 2×`. */
  readonly format: string;
  /** Pixel size of the finished image. */
  readonly dimensions: string;
  readonly warning?: string | null;
  /** Texts of the buttons over the preview. */
  readonly labels: ExportDialogPreviewLabels;
  readonly children?: ReactNode;
}

export function ExportDialogPreview({
  svg,
  size,
  pending,
  empty,
  padding,
  radius,
  background,
  ink,
  fill,
  labelBackground,
  format,
  dimensions,
  warning = null,
  labels,
  children,
}: ExportDialogPreviewProps): JSX.Element {
  const checkerId = useId().replace(/\W/g, "");
  const ready = svg !== null && size !== null;
  const rootRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const [stored, store] = usePersistedState(PIN_STORAGE_KEY, "");
  const roomy = useSettingsRoom(rootRef, MIN_SETTINGS_ROOM);
  const pinned = stored === "1";
  const stuck = pinned && roomy;

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative h-64 shrink-0 overflow-hidden bg-card bg-drafting-grid max-md:border-b md:h-auto md:min-h-112 md:flex-1",
        stuck && `max-md:sticky max-md:top-0 max-md:z-20 max-md:shadow-md`,
      )}
    >
      {ready ? (
        <ExportDialogPreviewPage
          svg={svg}
          size={size}
          padding={padding}
          radius={radius}
          background={background}
          checkerId={checkerId}
          transformRef={transformRef}
          colors={{
            color: ink,
            "--card": fill === "none" ? "transparent" : fill,
            "--background": labelBackground,
          }}
        />
      ) : (
        <p className="absolute inset-0 flex items-center justify-center gap-1.5 p-6 text-center text-xs text-muted-foreground">
          {pending ? (
            <Spinner />
          ) : (
            <>
              <IconAlertTriangle className="size-4" />
              {empty}
            </>
          )}
        </p>
      )}

      <Badge
        variant="outline-secondary"
        className="pointer-events-none absolute top-2 left-2 z-10 bg-background/40 backdrop-blur-xl md:top-3 md:left-3"
      >
        {format}
      </Badge>

      <Badge
        variant="outline-secondary"
        className="pointer-events-none absolute bottom-2 left-2 z-10 bg-background/40 backdrop-blur-xl md:bottom-3 md:left-3"
      >
        {dimensions}
      </Badge>

      {warning === null ? null : (
        <Badge
          variant="destructive"
          role="alert"
          className="pointer-events-none absolute right-2 bottom-2 z-10 h-auto max-w-[60%] border-destructive/40 py-1 text-left whitespace-normal backdrop-blur-xl md:right-3 md:bottom-3"
        >
          <IconAlertTriangle className="size-4 shrink-0" />
          {warning}
        </Badge>
      )}

      {ready ? (
        <ExportDialogPreviewControls
          labels={labels}
          onZoomIn={() => {
            void transformRef.current?.zoomIn();
          }}
          onZoomOut={() => {
            void transformRef.current?.zoomOut();
          }}
          onFit={() => {
            void transformRef.current?.resetTransform();
          }}
          pin={
            roomy
              ? {
                  pinned,
                  onToggle: () => {
                    store(pinned ? "" : "1");
                  },
                }
              : null
          }
        />
      ) : null}

      {children}
    </div>
  );
}
