import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type EmptyProps = ComponentProps<"div">;

export function Empty({ className, ...props }: EmptyProps): JSX.Element {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-dashed p-12 text-center text-balance",
        className,
      )}
      {...props}
    />
  );
}
