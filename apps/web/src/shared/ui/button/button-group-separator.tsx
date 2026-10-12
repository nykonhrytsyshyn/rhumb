import type { ComponentProps } from "react";
import { type JSX } from "react";

import { cn } from "@shared/lib/cn";
import { Separator } from "@shared/ui/separator";

export interface ButtonGroupSeparatorProps extends ComponentProps<
  typeof Separator
> {
  orientation?: "horizontal" | "vertical";
}

export function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: ButtonGroupSeparatorProps): JSX.Element {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",
        className,
      )}
      {...props}
    />
  );
}
