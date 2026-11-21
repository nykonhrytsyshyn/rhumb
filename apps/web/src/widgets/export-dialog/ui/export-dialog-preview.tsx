import { type JSX, type ReactNode, useId, useRef } from "react";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

import { IconAlertTriangle } from "@tabler/icons-react";

import { Badge } from "@shared/ui/badge";
import { Spinner } from "@shared/ui/spinner";

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
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  return (
    <div className="relative h-64 shrink-0 overflow-hidden bg-card bg-drafting-grid md:h-auto md:min-h-112 md:flex-1">
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
        className="pointer-events-none absolute top-3 left-3 z-10 bg-background/40 backdrop-blur-xl"
      >
        {format}
      </Badge>

      <Badge
        variant="outline-secondary"
        className="pointer-events-none absolute bottom-3 left-3 z-10 bg-background/40 backdrop-blur-xl"
      >
        {dimensions}
      </Badge>

      {warning === null ? null : (
        <Badge
          variant="destructive"
          role="alert"
          className="pointer-events-none absolute right-3 bottom-3 z-10 h-auto max-w-[60%] py-1 text-left whitespace-normal"
        >
          <IconAlertTriangle />
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
        />
      ) : null}

      {children}
    </div>
  );
}
