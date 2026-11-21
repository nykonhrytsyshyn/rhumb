import { type JSX, type ReactNode, useId } from "react";

import { IconAlertTriangle } from "@tabler/icons-react";

import { Badge } from "@shared/ui/badge";
import { Spinner } from "@shared/ui/spinner";

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
  readonly children?: ReactNode;
}

const CELL = 12;
const MAX_ENLARGEMENT = 2;

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
  children,
}: ExportDialogPreviewProps): JSX.Element {
  const checkerId = useId().replace(/\W/g, "");
  const ready = svg !== null && size !== null;

  return (
    <div className="relative flex h-64 shrink-0 items-center justify-center bg-card bg-drafting-grid p-6 md:h-auto md:min-h-112 md:flex-1">
      {ready ? (
        <PreviewPage
          svg={svg}
          size={size}
          padding={padding}
          radius={radius}
          background={background}
          checkerId={checkerId}
          colors={{
            color: ink,
            "--card": fill === "none" ? "transparent" : fill,
            "--background": labelBackground,
          }}
        />
      ) : (
        <p className="flex items-center gap-1.5 text-center text-xs text-muted-foreground">
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

      <Badge variant="secondary" className="absolute top-3 left-3">
        {format}
      </Badge>

      <Badge variant="secondary" className="absolute bottom-3 left-3">
        {dimensions}
      </Badge>

      {warning === null ? null : (
        <Badge
          variant="destructive"
          role="alert"
          className="absolute right-3 bottom-3 h-auto max-w-[60%] py-1 text-left whitespace-normal"
        >
          <IconAlertTriangle />
          {warning}
        </Badge>
      )}

      {children}
    </div>
  );
}

interface PreviewPageProps {
  readonly svg: string;
  readonly size: { readonly width: number; readonly height: number };
  readonly padding: number;
  readonly radius: number;
  readonly background: string | null;
  readonly checkerId: string;
  readonly colors: Record<string, string>;
}

function PreviewPage({
  svg,
  size,
  padding,
  radius,
  background,
  checkerId,
  colors,
}: PreviewPageProps): JSX.Element {
  const width = size.width + padding * 2;
  const height = size.height + padding * 2;
  const corner = Math.min(radius, width / 2, height / 2);

  return (
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
  );
}
