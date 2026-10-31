import type { ComponentProps, JSX } from "react";

export type PaginationItemProps = ComponentProps<"li">;

export function PaginationItem({ ...props }: PaginationItemProps): JSX.Element {
  return <li data-slot="pagination-item" {...props} />;
}
