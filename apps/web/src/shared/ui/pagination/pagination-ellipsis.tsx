import type { ComponentProps, JSX } from "react";

import { IconDots } from "@tabler/icons-react";

import { cn } from "@shared/lib/cn";

export type PaginationEllipsisProps = ComponentProps<"span">;

export function PaginationEllipsis({
  className,
  ...props
}: PaginationEllipsisProps): JSX.Element {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-9 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <IconDots />
    </span>
  );
}
