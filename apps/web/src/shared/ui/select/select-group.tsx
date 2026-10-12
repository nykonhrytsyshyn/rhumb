import type { JSX } from "react";

import { Select as SelectPrimitive } from "@base-ui/react/select";

import { cn } from "@shared/lib/cn";

export type SelectGroupProps = SelectPrimitive.Group.Props;

export function SelectGroup({
  className,
  ...props
}: SelectGroupProps): JSX.Element {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  );
}
