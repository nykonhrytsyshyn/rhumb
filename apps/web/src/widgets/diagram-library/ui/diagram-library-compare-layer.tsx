import type { JSX } from "react";

export interface DiagramLibraryCompareSide {
  readonly label: string;
  readonly svg: string | null;
  readonly size: { readonly width: number; readonly height: number } | null;
  readonly failed: boolean;
}

export interface DiagramLibraryCompareLayerProps {
  readonly side: DiagramLibraryCompareSide;
  readonly canvas: { readonly width: number; readonly height: number };
  readonly from: number;
  readonly to: number;
}

export function DiagramLibraryCompareLayer({
  side,
  canvas,
  from,
  to,
}: DiagramLibraryCompareLayerProps): JSX.Element | null {
  if (side.svg === null || side.size === null) {
    return null;
  }

  const x = (canvas.width - side.size.width) / 2;
  const y = (canvas.height - side.size.height) / 2;

  return (
    <div
      className="pointer-events-none absolute inset-0 p-4 text-foreground"
      style={{ clipPath: `inset(0 ${String(100 - to)}% 0 ${String(from)}%)` }}
    >
      <svg
        viewBox={`0 0 ${String(canvas.width)} ${String(canvas.height)}`}
        className="size-full"
        aria-hidden
      >
        <g
          transform={`translate(${String(x)} ${String(y)})`}
          dangerouslySetInnerHTML={{ __html: side.svg }}
        />
      </svg>
    </div>
  );
}
