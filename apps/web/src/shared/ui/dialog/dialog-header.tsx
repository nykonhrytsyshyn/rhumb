import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type DialogHeaderProps = ComponentProps<"div">;

export function DialogHeader({
  className,
  ...props
}: DialogHeaderProps): JSX.Element {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 text-left", className)}
      {...props}
    />
  );
}
