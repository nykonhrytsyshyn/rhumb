import type { JSX } from "react";

import { Select as SelectPrimitive } from "@base-ui/react/select";

import { cn } from "@shared/lib/cn";

export type SelectValueProps = SelectPrimitive.Value.Props;

export function SelectValue({
  className,
  ...props
}: SelectValueProps): JSX.Element {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  );
}
