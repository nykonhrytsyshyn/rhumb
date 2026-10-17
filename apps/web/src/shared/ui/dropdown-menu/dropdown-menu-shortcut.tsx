import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type DropdownMenuShortcutProps = ComponentProps<"span">;

export function DropdownMenuShortcut({
  className,
  ...props
}: DropdownMenuShortcutProps): JSX.Element {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}
