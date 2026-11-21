import type { JSX } from "react";

import { cn } from "@shared/lib/cn";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@shared/ui/input";

export interface PercentageInputProps {
  readonly value: number;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly className?: string;
}

export function PercentageInput({
  value,
  disabled = false,
  label = "Alpha",
  className,
}: PercentageInputProps): JSX.Element {
  return (
    <InputGroup className={cn("h-8 w-16 shrink-0", className)}>
      <InputGroupInput
        readOnly
        type="text"
        value={String(value)}
        disabled={disabled}
        aria-label={label}
        className="px-2 text-right font-mono text-xs tabular-nums"
      />

      <InputGroupAddon align="inline-end" className="pr-2">
        <InputGroupText className="text-xs">%</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}
