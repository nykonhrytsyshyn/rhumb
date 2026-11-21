import type { JSX, ReactNode } from "react";

import { cn } from "@shared/lib/cn";
import { DialogFooter } from "@shared/ui/dialog";

export interface ExportDialogFooterProps {
  readonly className?: string;
  readonly children: ReactNode;
}

export function ExportDialogFooter({
  className,
  children,
}: ExportDialogFooterProps): JSX.Element {
  return (
    <DialogFooter
      className={cn(
        "shrink-0 flex-col items-stretch gap-0 border-t p-0 sm:flex-row sm:items-stretch sm:justify-between",
        className,
      )}
    >
      {children}
    </DialogFooter>
  );
}
