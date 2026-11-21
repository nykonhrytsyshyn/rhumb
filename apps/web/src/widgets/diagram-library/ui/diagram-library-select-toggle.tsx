import type { JSX } from "react";

import { IconChecklist } from "@tabler/icons-react";

import { useT } from "@shared/i18n";
import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/tooltip";

export interface DiagramLibrarySelectToggleProps {
  readonly active: boolean;
  readonly onActiveChange: (active: boolean) => void;
}

export function DiagramLibrarySelectToggle({
  active,
  onActiveChange,
}: DiagramLibrarySelectToggleProps): JSX.Element {
  const t = useT();
  const label = t(
    active ? "editor.library.select.stop" : "editor.library.select.start",
  );

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-pressed={active}
            aria-label={label}
            data-state={active ? "on" : "off"}
            className={cn(
              "h-full w-12 rounded-none border-0 border-l data-[state=on]:bg-muted",
            )}
            onClick={() => {
              onActiveChange(!active);
            }}
          />
        }
      >
        <IconChecklist />
      </TooltipTrigger>

      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
