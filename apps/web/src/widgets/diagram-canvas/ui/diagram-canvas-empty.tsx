import type { JSX } from "react";

import { IconAlertTriangle, IconBinaryTree2 } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shared/ui/empty";

import { useDiagramCanvas } from "../model";

export function DiagramCanvasEmpty(): JSX.Element | null {
  const t = useT();
  const {
    state: { svg, error },
  } = useDiagramCanvas();

  if (svg !== null) {
    return null;
  }

  return (
    <Empty className="absolute top-1/2 left-1/2 w-[calc(100%-3rem)] max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card p-4 shadow-lg sm:max-w-sm sm:rounded-3xl sm:p-6">
      <EmptyHeader className="gap-2 sm:gap-3">
        <EmptyMedia variant="icon" className="mb-0">
          {error === null ? <IconBinaryTree2 /> : <IconAlertTriangle />}
        </EmptyMedia>

        <EmptyTitle className="text-base sm:text-lg">
          {error === null
            ? t("common.canvas.emptyTitle")
            : t("common.canvas.fixSourceTitle")}
        </EmptyTitle>

        <EmptyDescription className="text-xs sm:text-sm">
          {error === null
            ? t("common.canvas.emptyDescription")
            : t("common.canvas.fixSourceDescription")}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
