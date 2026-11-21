import type { JSX, ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";

export interface ExportDialogShellProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title?: string;
  readonly description?: string;
  readonly closeLabel: string;
  readonly children: ReactNode;
}

export function ExportDialogShell({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  children,
}: ExportDialogShellProps): JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeLabel={closeLabel}
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[calc(100dvw-2rem)] lg:max-w-[calc(100dvw-4rem)] xl:max-w-6xl"
      >
        <DialogHeader className="shrink-0 px-4 py-3.5 pr-14">
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
}
