import type { JSX, ReactNode } from "react";

import { Button } from "@shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/tooltip";

export interface StandardManagerActionProps {
  readonly label: string;
  readonly disabled?: boolean;
  readonly destructive?: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
}

export function StandardManagerAction({
  label,
  disabled = false,
  destructive = false,
  onClick,
  children,
}: StandardManagerActionProps): JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={destructive ? "destructive" : "outline"}
            size="icon-sm"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>

      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
