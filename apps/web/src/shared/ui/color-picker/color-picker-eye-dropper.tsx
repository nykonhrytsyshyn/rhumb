import type { JSX } from "react";

import { IconColorPicker } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/tooltip";

interface EyeDropperResult {
  readonly sRGBHex: string;
}

interface EyeDropperInstance {
  open(): Promise<EyeDropperResult>;
}

type EyeDropperConstructor = new () => EyeDropperInstance;

function getEyeDropperConstructor(): EyeDropperConstructor | undefined {
  if (typeof window === "undefined" || !("EyeDropper" in window)) {
    return undefined;
  }

  const candidate: unknown = window.EyeDropper;

  return typeof candidate === "function"
    ? (candidate as EyeDropperConstructor)
    : undefined;
}

export interface ColorPickerEyeDropperProps {
  readonly onPick: (hex: string) => void;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly className?: string;
}

export function ColorPickerEyeDropper({
  onPick,
  disabled = false,
  label,
  className,
}: ColorPickerEyeDropperProps): JSX.Element | null {
  const t = useT();
  const EyeDropperApi = getEyeDropperConstructor();

  if (EyeDropperApi === undefined) {
    return null;
  }

  const text = label ?? t("common.colorPicker.eyeDropper");

  const handlePick = async (): Promise<void> => {
    try {
      const result = await new EyeDropperApi().open();

      onPick(result.sRGBHex);
    } catch {
      // User dismissed the browser eye dropper.
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={disabled}
            aria-label={text}
            className={cn(
              "shrink-0 rounded-xl text-muted-foreground",
              className,
            )}
            onClick={() => {
              void handlePick();
            }}
          />
        }
      >
        <IconColorPicker />
      </TooltipTrigger>

      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}
