import { type JSX, useState } from "react";

import { cn } from "@shared/lib/cn";
import { Input } from "@shared/ui/input";

import type { ColorMode } from "./color-picker-output";
import { normalizeHexColor } from "./color-utils";
import { PercentageInput } from "./percentage-input";

export interface ColorPickerFormatProps {
  readonly hex: string;
  readonly rgb: readonly [number, number, number];
  readonly hsl: readonly [number, number, number];
  readonly alpha?: number;
  readonly showAlpha?: boolean;
  readonly mode: ColorMode;
  readonly disabled?: boolean;
  readonly onHexChange?: (hex: string) => void;
  readonly className?: string;
}

const RGB_LABELS = ["Red", "Green", "Blue"] as const;
const HSL_LABELS = ["Hue", "Saturation", "Lightness"] as const;

export function ColorPickerFormat({
  hex,
  rgb,
  hsl,
  alpha = 100,
  showAlpha = false,
  mode,
  disabled = false,
  onHexChange,
  className,
}: ColorPickerFormatProps): JSX.Element {
  const [draft, setDraft] = useState<string | null>(null);

  const alphaInput = showAlpha ? (
    <PercentageInput value={Math.round(alpha)} disabled={disabled} />
  ) : null;

  if (mode === "hex") {
    const editable = onHexChange !== undefined && !disabled;

    return (
      <div className={cn("flex min-w-0 flex-1 items-center gap-1", className)}>
        <Input
          type="text"
          readOnly={!editable}
          disabled={disabled}
          value={draft ?? hex}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          aria-label="Hex color"
          aria-invalid={draft !== null && normalizeHexColor(draft) === null}
          className="h-8 px-2 font-mono text-xs uppercase tabular-nums"
          onChange={(event) => {
            if (!editable) {
              return;
            }

            const text = event.target.value;
            const normalized = normalizeHexColor(text);

            setDraft(text);

            if (normalized !== null) {
              onHexChange(normalized);
            }
          }}
          onBlur={() => {
            setDraft(null);
          }}
        />

        {alphaInput}
      </div>
    );
  }

  const channels = mode === "rgb" ? rgb : hsl;
  const labels = mode === "rgb" ? RGB_LABELS : HSL_LABELS;

  return (
    <div className={cn("flex min-w-0 flex-1 items-center gap-1", className)}>
      {channels.map((channel, index) => (
        <Input
          key={labels[index]}
          readOnly
          type="text"
          disabled={disabled}
          value={String(channel)}
          aria-label={labels[index]}
          className="h-8 px-1.5 text-center font-mono text-xs tabular-nums"
        />
      ))}

      {alphaInput}
    </div>
  );
}
