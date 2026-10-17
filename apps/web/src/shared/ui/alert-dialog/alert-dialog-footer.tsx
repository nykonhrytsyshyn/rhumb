import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type AlertDialogFooterProps = ComponentProps<"div">;

export function AlertDialogFooter({
  className,
  ...props
}: AlertDialogFooterProps): JSX.Element {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
