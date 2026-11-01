import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type PaginationProps = ComponentProps<"nav">;

export function Pagination({
  className,
  ...props
}: PaginationProps): JSX.Element {
  return (
    <nav
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}
