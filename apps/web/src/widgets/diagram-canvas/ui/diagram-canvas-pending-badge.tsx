import type { JSX } from "react";

import { useT } from "@shared/i18n";
import { Badge } from "@shared/ui/badge";
import { Spinner } from "@shared/ui/spinner";

import { useDiagramCanvas } from "../model";

export function DiagramCanvasPendingBadge(): JSX.Element | null {
  const t = useT();
  const {
    state: { pending },
  } = useDiagramCanvas();

  if (!pending) {
    return null;
  }

  return (
    <Badge variant="outline">
      <Spinner data-icon="inline-start" />
      {t("common.canvas.updating")}
    </Badge>
  );
}
