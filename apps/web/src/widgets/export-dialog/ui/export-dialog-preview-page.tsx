import { type JSX, type RefObject, useState } from "react";
import {
  type ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

import {
  MAX_ZOOM,
  MIN_ZOOM,
  WHEEL_ZOOM_STEP,
  ZOOMED_THRESHOLD,
} from "../model";

const CELL = 12;
const MAX_ENLARGEMENT = 2;

export interface ExportDialogPreviewPageProps {
  readonly svg: string;
  readonly size: { readonly width: number; readonly height: number };
  readonly padding: number;
  readonly radius: number;
  readonly background: string | null;
  readonly checkerId: string;
  readonly colors: Record<string, string>;
  readonly transformRef: RefObject<ReactZoomPanPinchRef | null>;
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
}: ExportDialogPreviewPageProps): JSX.Element {
  const [zoomed, setZoomed] = useState(false);
  const width = size.width + padding * 2;
  const height = size.height + padding * 2;
  const corner = Math.min(radius, width / 2, height / 2);

  return (
    <TransformWrapper
      ref={transformRef}
      minScale={MIN_ZOOM}
      maxScale={MAX_ZOOM}
      limitToBounds
      centerZoomedOut
      doubleClick={{ mode: "reset" }}
      wheel={{ step: WHEEL_ZOOM_STEP }}
      panning={{ disabled: !zoomed }}
      onTransform={(_, state) => {
        setZoomed(state.scale > ZOOMED_THRESHOLD);
      }}
    >
      <TransformComponent
        wrapperClass="absolute! inset-0! size-full! cursor-grab active:cursor-grabbing"
        wrapperStyle={{ touchAction: zoomed ? "none" : "pan-y" }}
        contentClass="size-full! flex-nowrap! items-center justify-center p-6"
      >
        <svg
          viewBox={`0 0 ${String(width)} ${String(height)}`}
          className="size-full drop-shadow-md"
          style={{
            maxWidth: width * MAX_ENLARGEMENT,
            maxHeight: height * MAX_ENLARGEMENT,
          }}
          aria-hidden
        >
          {background === null ? (
            <>
              <defs>
                <pattern
                  id={checkerId}
                  width={CELL * 2}
                  height={CELL * 2}
                  patternUnits="userSpaceOnUse"
                >
                  <rect width={CELL} height={CELL} fill="var(--muted)" />
                  <rect
                    x={CELL}
                    y={CELL}
                    width={CELL}
                    height={CELL}
                    fill="var(--muted)"
                  />
                </pattern>
              </defs>

              <rect width={width} height={height} fill={`url(#${checkerId})`} />
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
  );
}
