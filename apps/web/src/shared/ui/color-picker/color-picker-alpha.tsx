import type { JSX } from "react";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@shared/lib/cn";

export interface ColorPickerAlphaProps {
  readonly alpha: number;
  readonly color: string;
  readonly onChange: (alpha: number) => void;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly className?: string;
}

export function ColorPickerAlpha({
  alpha,
  color,
  onChange,
  disabled = false,
  label = "Alpha",
  className,
}: ColorPickerAlphaProps): JSX.Element {
  return (
    <SliderPrimitive.Root
      data-slot="color-picker-alpha"
      value={alpha}
      min={0}
      max={100}
      step={1}
      disabled={disabled}
      onValueChange={(next) => {
        onChange(next);
      }}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50",
        className,
      )}
    >
      <SliderPrimitive.Control className="flex h-5 w-full cursor-pointer items-center data-disabled:cursor-not-allowed">
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full border bg-[conic-gradient(var(--muted)_25%,transparent_0_50%,var(--muted)_0_75%,transparent_0)] bg-[length:8px_8px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, transparent, ${color})`,
            }}
          />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb
          aria-label={label}
          className="block size-4 rounded-full border-2 border-white bg-background shadow-sm ring-1 ring-black/30 transition-shadow outline-none hover:ring-3 hover:ring-ring/30 focus-visible:ring-3 focus-visible:ring-ring/50 data-dragging:ring-3 data-dragging:ring-ring/50"
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}
