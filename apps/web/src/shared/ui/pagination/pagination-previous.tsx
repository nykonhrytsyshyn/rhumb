import type { JSX } from "react";

import { IconChevronLeft } from "@tabler/icons-react";

import { cn } from "@shared/lib/cn";

import { PaginationLink, type PaginationLinkProps } from "./pagination-link";

export type PaginationPreviousProps = PaginationLinkProps;

export function PaginationPrevious({
  className,
  children,
  ...props
}: PaginationPreviousProps): JSX.Element {
  return (
    <PaginationLink
      data-slot="pagination-previous"
      size={children === undefined ? "icon" : "default"}
      className={cn(className)}
      {...props}
    >
      <IconChevronLeft data-icon="inline-start" />

      {children}
    </PaginationLink>
  );
}
