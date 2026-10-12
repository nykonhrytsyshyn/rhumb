import type { JSX } from "react";

import { Select as SelectPrimitive } from "@base-ui/react/select";

import { cn } from "@shared/lib/cn";

export type SelectLabelProps = SelectPrimitive.GroupLabel.Props;

export function SelectLabel({
  className,
  ...props
}: SelectLabelProps): JSX.Element {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}
