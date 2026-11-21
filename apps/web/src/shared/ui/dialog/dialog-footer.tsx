import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type DialogFooterProps = ComponentProps<"div">;

export function DialogFooter({
  className,
  ...props
}: DialogFooterProps): JSX.Element {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
