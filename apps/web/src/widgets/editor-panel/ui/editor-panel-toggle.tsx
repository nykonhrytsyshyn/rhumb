import type { JSX } from "react";

import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { Button } from "@shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/tooltip";

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
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={label}
            onClick={() => {
              onOpenChange(!open);
            }}
            className="bg-background"
          />
        }
      >
        {open ? (
          <IconLayoutSidebarLeftCollapse />
        ) : (
          <IconLayoutSidebarLeftExpand />
        )}
      </TooltipTrigger>

      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
