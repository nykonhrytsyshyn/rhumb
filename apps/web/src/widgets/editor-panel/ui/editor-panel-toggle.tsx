import type { JSX } from "react";

import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";

export interface EditorPanelToggleProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function EditorPanelToggle({
  open,
  onOpenChange,
}: EditorPanelToggleProps): JSX.Element {
  const t = useT();
  const label = open ? t("common.panel.close") : t("common.panel.open");

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={() => {
        onOpenChange(!open);
      }}
    >
      {open ? (
        <IconLayoutSidebarLeftCollapse />
      ) : (
        <IconLayoutSidebarLeftExpand />
      )}
    </Button>
  );
}
