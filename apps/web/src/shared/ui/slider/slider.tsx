import type { JSX } from "react";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@shared/lib/cn";

export type SliderProps = SliderPrimitive.Root.Props;

export function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderProps): JSX.Element {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];

  return (
    <SliderPrimitive.Root
      className={cn(
        "group/slider data-dragging:cursor-grabbing data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
        className,
      )}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none group-data-dragging/slider:cursor-grabbing data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary/80 select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="relative block shrink-0 cursor-grab rounded-full border border-border/50 bg-white shadow-sm ring-ring/50 transition-[color,box-shadow,transform] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:scale-95 active:cursor-grabbing active:ring-3 disabled:pointer-events-none disabled:opacity-50 data-dragging:scale-95 data-dragging:cursor-grabbing data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-6 data-[orientation=vertical]:h-7 data-[orientation=vertical]:w-4"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}
