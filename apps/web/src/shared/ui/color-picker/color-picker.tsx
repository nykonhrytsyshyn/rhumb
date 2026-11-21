import { type JSX, useState } from "react";

import { cn } from "@shared/lib/cn";

import { ColorPickerAlpha } from "./color-picker-alpha";
import { ColorPickerEyeDropper } from "./color-picker-eye-dropper";
import { ColorPickerFormat } from "./color-picker-format";
import { ColorPickerHue } from "./color-picker-hue";
import { type ColorMode, ColorPickerOutput } from "./color-picker-output";
import { ColorPickerSelection } from "./color-picker-selection";
import {
  DEFAULT_HSV,
  type HsvColor,
  formatHsv,
  parseColorToHsv,
} from "./color-utils";

export interface ColorPickerProps {
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onChange?: (hex: string) => void;
  readonly showAlpha?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
}

export function ColorPicker({
  value,
  defaultValue = "#000000",
  onChange,
  showAlpha = false,
  disabled = false,
  className,
}: ColorPickerProps): JSX.Element {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const parsed = parseColorToHsv(value ?? internalValue) ?? DEFAULT_HSV;

  const [savedHue, setSavedHue] = useState(parsed.hue);
  const [savedSaturation, setSavedSaturation] = useState(parsed.saturation);
  const [mode, setMode] = useState<ColorMode>("hex");

  const hsv: HsvColor = {
    hue:
      parsed.saturation === 0 || parsed.brightness === 0
        ? savedHue
        : parsed.hue === 0 && savedHue === 360
          ? 360
          : parsed.hue,
    saturation: parsed.brightness === 0 ? savedSaturation : parsed.saturation,
    brightness: parsed.brightness,
    alpha: showAlpha ? parsed.alpha : 100,
  };

  const formatted = formatHsv(hsv, showAlpha);

  const commit = (next: HsvColor): void => {
    const { output } = formatHsv(next, showAlpha);

    if (value === undefined) {
      setInternalValue(output);
    }

    onChange?.(output);
  };

  const handlePickedColor = (raw: string): void => {
    const picked = parseColorToHsv(raw);

    if (picked === null) {
      return;
    }

    setSavedHue(picked.hue);
    setSavedSaturation(picked.saturation);
    commit({ ...picked, alpha: showAlpha ? picked.alpha : 100 });
  };

  return (
    <div
      data-slot="color-picker"
      className={cn("flex w-full flex-col gap-3", className)}
    >
      <ColorPickerSelection
        hue={hsv.hue}
        saturation={hsv.saturation}
        brightness={hsv.brightness}
        color={formatted.hex}
        disabled={disabled}
        onChange={(saturation, brightness) => {
          setSavedHue(hsv.hue);
          setSavedSaturation(saturation);
          commit({ ...hsv, saturation, brightness });
        }}
      />

      <div className="flex items-center gap-2">
        <ColorPickerEyeDropper disabled={disabled} onPick={handlePickedColor} />

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <ColorPickerHue
            hue={hsv.hue}
            disabled={disabled}
            onChange={(hue) => {
              setSavedHue(hue);
              commit({ ...hsv, hue });
            }}
          />

          {showAlpha ? (
            <ColorPickerAlpha
              alpha={hsv.alpha}
              color={formatted.hex}
              disabled={disabled}
              onChange={(alpha) => {
                commit({ ...hsv, alpha });
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ColorPickerOutput mode={mode} disabled={disabled} onChange={setMode} />

        <ColorPickerFormat
          hex={formatted.hex}
          rgb={formatted.rgb}
          hsl={formatted.hsl}
          alpha={hsv.alpha}
          showAlpha={showAlpha}
          mode={mode}
          disabled={disabled}
          onHexChange={handlePickedColor}
        />
      </div>
    </div>
  );
}
