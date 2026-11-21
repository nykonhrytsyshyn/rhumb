import type { JSX } from "react";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { useT } from "@shared/i18n";
import { cn } from "@shared/lib/cn";

export interface ColorPickerHueProps {
  readonly hue: number;
  readonly onChange: (hue: number) => void;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly className?: string;
}

export function ColorPickerHue({
  hue,
  onChange,
  disabled = false,
  label,
  className,
}: ColorPickerHueProps): JSX.Element {
  const t = useT();
  const text = label ?? t("common.colorPicker.hue");

  return (
    <SliderPrimitive.Root
      data-slot="color-picker-hue"
      value={hue}
      min={0}
      max={360}
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
        <SliderPrimitive.Track className="relative h-3 w-full grow rounded-full border bg-[linear-gradient(90deg,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)]" />

        <SliderPrimitive.Thumb
          aria-label={text}
          className="block size-4 rounded-full border-2 border-white shadow-sm ring-1 ring-black/30 transition-shadow outline-none hover:ring-3 hover:ring-ring/30 focus-visible:ring-3 focus-visible:ring-ring/50 data-dragging:ring-3 data-dragging:ring-ring/50"
          style={{ backgroundColor: `hsl(${String(hue)} 100% 50%)` }}
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}
