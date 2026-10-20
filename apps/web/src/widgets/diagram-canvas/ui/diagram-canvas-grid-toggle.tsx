import type { JSX } from "react";

import { IconGridDots } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";

import { useDiagramCanvas } from "../model";

export function DiagramCanvasGridToggle(): JSX.Element {
  const t = useT();
  const { grid, toggleGrid } = useDiagramCanvas();

  return (
    <Button
      variant={grid ? "ghost" : "outline"}
      size="icon-sm"
      aria-label={t("common.canvas.grid")}
      aria-pressed={grid}
      title={t("common.canvas.grid")}
      onClick={toggleGrid}
    >
      <IconGridDots />
    </Button>
  );
}
