import type { JSX } from "react";

import { IconAlertTriangle } from "@tabler/icons-react";

import { useT } from "@shared/i18n";

import { useDiagramCanvas } from "../model";

export function DiagramCanvasAlert(): JSX.Element | null {
  const t = useT();
  const {
    state: { svg, error },
  } = useDiagramCanvas();

  if (error === null || svg === null) {
    return null;
  }

  return (
    <div
      role="status"
      className="absolute top-16 left-1/2 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-destructive/40 bg-background/90 bg-destructive/10 px-3 py-1.5 text-xs text-destructive backdrop-blur sm:top-5"
    >
      <IconAlertTriangle className="size-4 shrink-0" />
      <span className="truncate">{t("common.canvas.fixSourceAlert")}</span>
    </div>
  );
}
