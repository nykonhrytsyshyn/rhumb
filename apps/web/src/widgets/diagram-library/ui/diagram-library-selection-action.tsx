import type { JSX, ReactNode } from "react";

import { Button } from "@shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/tooltip";

export interface DiagramLibrarySelectionActionProps {
  readonly label: string;
  readonly disabled?: boolean;
  readonly destructive?: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
}

export function DiagramLibrarySelectionAction({
  label,
  disabled = false,
  destructive = false,
  onClick,
  children,
}: DiagramLibrarySelectionActionProps): JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-flex h-full">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={label}
              disabled={disabled}
              className={
                destructive
                  ? "h-full w-12 rounded-none border-0 border-l text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                  : "h-full w-12 rounded-none border-0 border-l"
              }
              onClick={onClick}
            >
              {children}
            </Button>
          </span>
        }
      />

      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
