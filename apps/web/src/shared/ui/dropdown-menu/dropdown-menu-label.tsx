import type { JSX } from "react";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";

import { cn } from "@shared/lib/cn";

export interface DropdownMenuLabelProps extends MenuPrimitive.GroupLabel.Props {
  inset?: boolean;
}

export function DropdownMenuLabel({
  className,
  inset,
  ...props
}: DropdownMenuLabelProps): JSX.Element {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-3 py-2.5 text-xs text-muted-foreground data-inset:pl-9.5",
        className,
      )}
      {...props}
    />
  );
}
