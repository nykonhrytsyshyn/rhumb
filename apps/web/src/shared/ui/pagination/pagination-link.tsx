import type { JSX } from "react";

import { cn } from "@shared/lib/cn";
import { Button, type ButtonProps } from "@shared/ui/button";

export interface PaginationLinkProps extends Omit<ButtonProps, "variant"> {
  readonly isActive?: boolean;
}

export function PaginationLink({
  className,
  isActive = false,
  size = "icon",
  type = "button",
  ...props
}: PaginationLinkProps): JSX.Element {
  return (
    <Button
      data-slot="pagination-link"
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      type={type}
      variant={isActive ? "default" : "ghost"}
      size={size}
      className={cn("rounded-none", className)}
      {...props}
    />
  );
}
