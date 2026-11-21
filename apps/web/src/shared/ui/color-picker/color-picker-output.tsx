import type { JSX } from "react";

import { cn } from "@shared/lib/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

export const COLOR_MODES = ["hex", "rgb", "hsl"] as const;

export type ColorMode = (typeof COLOR_MODES)[number];

function isColorMode(value: string): value is ColorMode {
  return (COLOR_MODES as readonly string[]).includes(value);
}

export interface ColorPickerOutputProps {
  readonly mode: ColorMode;
  readonly onChange: (mode: ColorMode) => void;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly className?: string;
}

export function ColorPickerOutput({
  mode,
  onChange,
  disabled = false,
  label = "Color format",
  className,
}: ColorPickerOutputProps): JSX.Element {
  return (
    <Select
      value={mode}
      disabled={disabled}
      onValueChange={(next) => {
        if (typeof next === "string" && isColorMode(next)) {
          onChange(next);
        }
      }}
    >
      <SelectTrigger
        size="sm"
        aria-label={label}
        className={cn("w-20 shrink-0", className)}
      >
        <SelectValue>
          {(current: string | null) =>
            current === null ? "HEX" : current.toUpperCase()
          }
        </SelectValue>
      </SelectTrigger>

      <SelectContent alignItemWithTrigger={false}>
        {COLOR_MODES.map((format) => (
          <SelectItem key={format} value={format} className="text-xs">
            {format.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
