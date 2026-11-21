import type { JSX } from "react";

import { Field, FieldLabel } from "@shared/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@shared/ui/toggle-group";

export interface ExportDialogChoiceOption<Value extends string> {
  readonly value: Value;
  readonly label: string;
}

export interface ExportDialogChoiceProps<Value extends string> {
  readonly label: string;
  readonly value: Value;
  readonly options: readonly ExportDialogChoiceOption<Value>[];
  readonly onChange: (value: Value) => void;
  readonly disabled?: boolean;
}

export function ExportDialogChoice<Value extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: ExportDialogChoiceProps<Value>): JSX.Element {
  return (
    <Field data-disabled={disabled} className="gap-1.5">
      <FieldLabel className="text-xs font-normal text-muted-foreground">
        {label}
      </FieldLabel>

      <ToggleGroup
        value={[value]}
        disabled={disabled}
        aria-label={label}
        className="w-full"
        onValueChange={(next) => {
          const [chosen] = next;

          if (chosen !== undefined) {
            onChange(chosen);
          }
        }}
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  );
}
