import type { JSX, ReactNode } from "react";

import { Button } from "@shared/ui/button";

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
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={
        destructive
          ? "h-full w-12 rounded-none border-0 border-l text-destructive hover:text-destructive"
          : "h-full w-12 rounded-none border-0 border-l"
      }
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
