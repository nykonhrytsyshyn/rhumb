import {
  type JSX,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { useT } from "@shared/i18n";
import { cn } from "@shared/lib/cn";

export interface ColorPickerSelectionProps {
  readonly hue: number;
  readonly saturation: number;
  readonly brightness: number;
  readonly color: string;
  readonly onChange: (saturation: number, brightness: number) => void;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly className?: string;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

const STEP = 1;
const BIG_STEP = 10;

export function ColorPickerSelection({
  hue,
  saturation,
  brightness,
  color,
  onChange,
  disabled = false,
  label,
  className,
}: ColorPickerSelectionProps): JSX.Element {
  const t = useT();
  const text = label ?? t("common.colorPicker.selection");

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const [dragPos, setDragPos] = useState<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) {
      return;
    }

    const { width, height } = canvas;

    const satGrad = ctx.createLinearGradient(0, 0, width, 0);
    satGrad.addColorStop(0, "#fff");
    satGrad.addColorStop(1, `hsl(${String(hue)} 100% 50%)`);
    ctx.fillStyle = satGrad;
    ctx.fillRect(0, 0, width, height);

    const valGrad = ctx.createLinearGradient(0, 0, 0, height);
    valGrad.addColorStop(0, "transparent");
    valGrad.addColorStop(1, "#000");
    ctx.fillStyle = valGrad;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  const moveTo = (clientX: number, clientY: number): void => {
    const rect =
      rectRef.current ?? containerRef.current?.getBoundingClientRect() ?? null;

    if (rect === null || rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    setDragPos({ x, y });
    onChange(x * 100, (1 - y) * 100);
  };

  const stopDragging = (): void => {
    rectRef.current = null;
    setDragPos(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (disabled) {
      return;
    }

    const step = event.shiftKey ? BIG_STEP : STEP;
    let nextSaturation = saturation;
    let nextBrightness = brightness;

    switch (event.key) {
      case "ArrowLeft":
        nextSaturation = Math.max(0, saturation - step);
        break;
      case "ArrowRight":
        nextSaturation = Math.min(100, saturation + step);
        break;
      case "ArrowUp":
        nextBrightness = Math.min(100, brightness + step);
        break;
      case "ArrowDown":
        nextBrightness = Math.max(0, brightness - step);
        break;
      default:
        return;
    }

    event.preventDefault();
    onChange(nextSaturation, nextBrightness);
  };

  const thumbX = dragPos !== null ? dragPos.x * 100 : saturation;
  const thumbY = dragPos !== null ? dragPos.y * 100 : 100 - brightness;

  return (
    <div
      ref={containerRef}
      data-slot="color-picker-selection"
      data-disabled={disabled}
      onPointerDown={(event) => {
        if (disabled) {
          return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        rectRef.current = event.currentTarget.getBoundingClientRect();
        moveTo(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (dragPos !== null) {
          moveTo(event.clientX, event.clientY);
        }
      }}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      className={cn(
        "relative h-40 w-full touch-none rounded-md select-none",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-crosshair",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        width={256}
        height={256}
        className="pointer-events-none block size-full rounded-[inherit]"
      />

      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={text}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(thumbX)}
        aria-valuetext={`${String(Math.round(thumbX))}%, ${String(Math.round(100 - thumbY))}%`}
        onKeyDown={onKeyDown}
        className="pointer-events-none absolute size-4 rounded-full border-2 border-white shadow-sm ring-1 ring-black/30 will-change-[left,top] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        style={{
          left: `${String(thumbX)}%`,
          top: `${String(thumbY)}%`,
          transform: "translate3d(-50%, -50%, 0)",
          backgroundColor: color,
        }}
      />
    </div>
  );
}
