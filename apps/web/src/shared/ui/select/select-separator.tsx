import type { JSX } from "react";

import { Select as SelectPrimitive } from "@base-ui/react/select";

import { cn } from "@shared/lib/cn";

export type SelectSeparatorProps = SelectPrimitive.Separator.Props;

export function SelectSeparator({
  className,
  ...props
}: SelectSeparatorProps): JSX.Element {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}
