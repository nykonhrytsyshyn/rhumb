import type { JSX } from "react";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";

import { cn } from "@shared/lib/cn";

export type DropdownMenuSeparatorProps = MenuPrimitive.Separator.Props;

export function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps): JSX.Element {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1.5 my-1.5 h-px bg-border/50", className)}
      {...props}
    />
  );
}
