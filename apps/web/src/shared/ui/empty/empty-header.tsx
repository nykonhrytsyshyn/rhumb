import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type EmptyHeaderProps = ComponentProps<"div">;

export function EmptyHeader({
  className,
  ...props
}: EmptyHeaderProps): JSX.Element {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-2", className)}
      {...props}
    />
  );
}
