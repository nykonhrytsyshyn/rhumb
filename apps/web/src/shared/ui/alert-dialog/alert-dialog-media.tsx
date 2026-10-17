import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type AlertDialogMediaProps = ComponentProps<"div">;

export function AlertDialogMedia({
  className,
  ...props
}: AlertDialogMediaProps): JSX.Element {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-2 inline-flex size-16 items-center justify-center rounded-full bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8",
        className,
      )}
      {...props}
    />
  );
}
