import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type EmptyContentProps = ComponentProps<"div">;

export function EmptyContent({
  className,
  ...props
}: EmptyContentProps): JSX.Element {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        className,
      )}
      {...props}
    />
  );
}
