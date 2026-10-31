import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type PaginationContentProps = ComponentProps<"ul">;

export function PaginationContent({
  className,
  ...props
}: PaginationContentProps): JSX.Element {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex divide-x", className)}
      {...props}
    />
  );
}
