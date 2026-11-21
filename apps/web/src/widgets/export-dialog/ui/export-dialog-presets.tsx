import type { JSX } from "react";

import { cn } from "@shared/lib/cn";
import { ToggleGroup, ToggleGroupItem } from "@shared/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/tooltip";

export interface ExportDialogPreset<Id extends string = string> {
  readonly id: Id;
  readonly label: string;
  readonly ink: string;
  readonly fill: string;
  readonly hollow: boolean;
  readonly background: string;
  readonly transparent: boolean;
}

export interface ExportDialogPresetsProps<Id extends string> {
  readonly label: string;
  readonly presets: readonly ExportDialogPreset<Id>[];
  readonly value: Id | null;
  readonly onChange: (id: Id) => void;
}

const CHECKER =
  "bg-[conic-gradient(var(--muted)_25%,transparent_0_50%,var(--muted)_0_75%,transparent_0)] bg-[length:8px_8px]";

export function ExportDialogPresets<Id extends string>({
  label,
  presets,
  value,
  onChange,
}: ExportDialogPresetsProps<Id>): JSX.Element {
  return (
    <ToggleGroup
      value={value === null ? [] : [value]}
      aria-label={label}
      className="grid w-full grid-cols-5 gap-2 overflow-visible rounded-none border-0 bg-transparent"
      onValueChange={(next) => {
        const [chosen] = next;

        if (chosen !== undefined) {
          onChange(chosen);
        }
      }}
    >
      {presets.map((preset) => (
        <Tooltip key={preset.id}>
          <TooltipTrigger
            render={
              <ToggleGroupItem
                value={preset.id}
                aria-label={preset.label}
                className="h-auto w-full flex-none overflow-hidden rounded-xl border p-0 data-pressed:bg-transparent data-pressed:ring-2 data-pressed:ring-ring data-pressed:hover:bg-transparent"
              />
            }
          >
            <span
              className={cn(
                "flex h-10 w-full items-center justify-center",
                preset.transparent && CHECKER,
              )}
              style={
                preset.transparent
                  ? undefined
                  : { backgroundColor: preset.background }
              }
            >
              <span
                className="h-5.5 w-8.5 rounded-md border-2"
                style={{
                  borderColor: preset.ink,
                  backgroundColor: preset.hollow ? "transparent" : preset.fill,
                }}
              />
            </span>
          </TooltipTrigger>

          <TooltipContent>{preset.label}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  );
}
