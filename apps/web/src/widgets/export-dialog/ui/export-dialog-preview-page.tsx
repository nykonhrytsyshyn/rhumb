import type { JSX, RefObject } from "react";
import {
  type ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

import { type PreviewFit, WHEEL_ZOOM_STEP } from "../model";

const CELL = 12;

export interface ExportDialogPreviewPageProps {
  readonly svg: string;
  readonly size: { readonly width: number; readonly height: number };
  readonly padding: number;
  readonly radius: number;
  readonly background: string | null;
  readonly checkerId: string;
  readonly colors: Record<string, string>;
  readonly transformRef: RefObject<ReactZoomPanPinchRef | null>;
  readonly fit: PreviewFit;
}

export function ExportDialogPreviewPage({
  svg,
  size,
  padding,
  radius,
  background,
  checkerId,
  colors,
  transformRef,
  fit,
}: ExportDialogPreviewPageProps): JSX.Element {
  const {
    fitScale,
    maxScale,
    zoomed,
    syncZoomed,
    toggleZoom,
    fit: fitView,
  } = fit;
  const width = size.width + padding * 2;
  const height = size.height + padding * 2;
  const corner = Math.min(radius, width / 2, height / 2);
  const cell = CELL / fitScale;

  return (
    <div className="absolute inset-0" onDoubleClick={toggleZoom}>
      <TransformWrapper
        ref={transformRef}
        initialScale={fitScale}
        minScale={fitScale}
        maxScale={maxScale}
        limitToBounds
        centerOnInit
        centerZoomedOut
        doubleClick={{ disabled: true }}
        wheel={{ step: WHEEL_ZOOM_STEP }}
        panning={{ disabled: !zoomed }}
        onInit={() => {
          fitView(0);
        }}
        onTransform={(_, state) => {
          syncZoomed(state.scale);
        }}
      >
        <TransformComponent
          wrapperClass="absolute! inset-0! size-full! cursor-grab active:cursor-grabbing"
          wrapperStyle={{ touchAction: zoomed ? "none" : "pan-y" }}
          contentClass="flex-nowrap!"
        >
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${String(width)} ${String(height)}`}
            className="block"
            style={{
              borderRadius: background === null ? 0 : corner,
              boxShadow: `0 ${String(4 / fitScale)}px ${String(12 / fitScale)}px rgb(0 0 0 / 0.14), 0 0 0 ${String(1 / fitScale)}px rgb(0 0 0 / 0.06)`,
            }}
            aria-hidden
          >
            {background === null ? (
              <>
                <defs>
                  <pattern
                    id={checkerId}
                    width={cell * 2}
                    height={cell * 2}
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width={cell} height={cell} fill="var(--muted)" />
                    <rect
                      x={cell}
                      y={cell}
                      width={cell}
                      height={cell}
                      fill="var(--muted)"
                    />
                  </pattern>
                </defs>

                <rect
                  width={width}
                  height={height}
                  fill={`url(#${checkerId})`}
                />
              </>
            ) : (
              <rect
                width={width}
                height={height}
                rx={corner}
                ry={corner}
                fill={background}
              />
            )}

            <g
              transform={`translate(${String(padding)} ${String(padding)})`}
              style={colors}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
