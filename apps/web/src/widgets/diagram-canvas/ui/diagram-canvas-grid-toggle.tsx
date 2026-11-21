import type { JSX } from "react";

import { IconGridDots } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/tooltip";

import { useDiagramCanvas } from "../model";

export function DiagramCanvasGridToggle(): JSX.Element {
  const t = useT();
  const { grid, toggleGrid } = useDiagramCanvas();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={grid ? "ghost" : "outline"}
            size="icon-sm"
            aria-label={t("common.canvas.grid")}
            aria-pressed={grid}
            onClick={toggleGrid}
          />
        }
      >
        <IconGridDots />
      </TooltipTrigger>

      <TooltipContent side="right">{t("common.canvas.grid")}</TooltipContent>
    </Tooltip>
  );
}
