import { type JSX, useId } from "react";

import { Label } from "@shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

export interface DiagramLibraryFilterOption {
  readonly value: string;
  readonly label: string;
}

export interface DiagramLibraryFilterChoice {
  readonly value: string;
  readonly options: readonly DiagramLibraryFilterOption[];
  readonly onChange: (value: string) => void;
}

export interface DiagramLibraryFilterSelectProps {
  readonly label: string;
  readonly choice: DiagramLibraryFilterChoice;
}

export function DiagramLibraryFilterSelect({
  label,
  choice,
}: DiagramLibraryFilterSelectProps): JSX.Element {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-xs uppercase">
        {label}
      </Label>

      <Select
        value={choice.value}
        onValueChange={(value) => {
          if (typeof value === "string") {
            choice.onChange(value);
          }
        }}
      >
        <SelectTrigger id={id} aria-label={label} className="w-full rounded-xl">
          <SelectValue>
            {(value: string | null) =>
              choice.options.find((option) => option.value === value)?.label ??
              value
            }
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {choice.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
