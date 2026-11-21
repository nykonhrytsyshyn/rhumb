import type { JSX } from "react";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";

import { cn } from "@shared/lib/cn";

export type ToggleGroupItemProps<Value extends string = string> =
  TogglePrimitive.Props<Value>;

export function ToggleGroupItem<Value extends string = string>({
  className,
  ...props
}: ToggleGroupItemProps<Value>): JSX.Element {
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none select-none hover:bg-muted hover:text-foreground focus-visible:relative focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 data-pressed:bg-primary data-pressed:text-primary-foreground data-pressed:hover:bg-primary/90 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}
