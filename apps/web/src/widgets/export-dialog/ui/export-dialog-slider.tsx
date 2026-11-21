import type { JSX } from "react";

import { Field, FieldLabel } from "@shared/ui/field";
import { Slider } from "@shared/ui/slider";

export interface ExportDialogSliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly valueText: string;
  readonly onChange: (value: number) => void;
  readonly disabled?: boolean;
}

export function ExportDialogSlider({
  label,
  value,
  min,
  max,
  step,
  valueText,
  onChange,
  disabled = false,
}: ExportDialogSliderProps): JSX.Element {
  return (
    <Field data-disabled={disabled} className="gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <FieldLabel className="text-xs font-normal text-muted-foreground">
          {label}
        </FieldLabel>

        <span className="text-xs font-medium tabular-nums">{valueText}</span>
      </div>

      <Slider
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={(next) => {
          onChange((Array.isArray(next) ? next[0] : next) as number);
        }}
      />
    </Field>
  );
}
