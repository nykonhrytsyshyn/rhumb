import type { JSX } from "react";

import { IconChevronRight } from "@tabler/icons-react";

import { cn } from "@shared/lib/cn";

import { PaginationLink, type PaginationLinkProps } from "./pagination-link";

export type PaginationNextProps = PaginationLinkProps;

export function PaginationNext({
  className,
  children,
  ...props
}: PaginationNextProps): JSX.Element {
  return (
    <PaginationLink
      data-slot="pagination-next"
      size={children === undefined ? "icon" : "default"}
      className={cn(className)}
      {...props}
    >
      {children}

      <IconChevronRight data-icon="inline-end" />
    </PaginationLink>
  );
}
