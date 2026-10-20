import type { JSX } from "react";

import { useT } from "@shared/i18n";

import { useEditorPanel, useSheetGestures } from "../model";

export function EditorPanelHandle(): JSX.Element {
  const t = useT();
  const { open, onOpenChange } = useEditorPanel();
  const gestures = useSheetGestures(open, onOpenChange);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={t("common.panel.handle")}
      aria-expanded={open}
      className="flex h-10 shrink-0 touch-none flex-col items-center justify-center gap-1.5 p-4 md:hidden"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onOpenChange(!open);
        }
      }}
      {...gestures}
    >
      <span className="h-1 w-10 rounded-full bg-foreground/25" />
    </div>
  );
}
