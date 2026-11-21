import type { JSX } from "react";

import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";

import { cn } from "@shared/lib/cn";

export type ToggleGroupProps<Value extends string = string> =
  ToggleGroupPrimitive.Props<Value>;

export function ToggleGroup<Value extends string = string>({
  className,
  ...props
}: ToggleGroupProps<Value>): JSX.Element {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn(
        "flex w-fit items-stretch divide-x divide-border overflow-hidden rounded-4xl border bg-background/10",
        className,
      )}
      {...props}
    />
  );
}
