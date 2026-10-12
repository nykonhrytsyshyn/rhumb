import type { JSX } from "react";

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "@shared/lib/cn";

export type SeparatorProps = SeparatorPrimitive.Props;

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps): JSX.Element {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className,
      )}
      {...props}
    />
  );
}
