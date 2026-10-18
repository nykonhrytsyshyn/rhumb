import { type JSX } from "react";

import { Field, FieldLabel } from "@shared/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

export interface ChoiceOption {
  readonly value: string;
  readonly label: string;
}

export interface ChoiceFieldProps {
  readonly path: string;
  readonly label: string;
  readonly value: string;
  readonly options: readonly ChoiceOption[];
  readonly disabled: boolean;
  readonly onChange: (path: string, value: string) => void;
}

export function ChoiceField({
  path,
  label,
  value,
  options,
  disabled,
  onChange,
}: ChoiceFieldProps): JSX.Element {
  return (
    <Field data-disabled={disabled}>
      <FieldLabel>{label}</FieldLabel>

      <Select
        value={value}
        disabled={disabled}
        onValueChange={(next) => {
          if (typeof next === "string") {
            onChange(path, next);
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue>
            {(current: string | null) =>
              options.find((option) => option.value === current)?.label ??
              current
            }
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
