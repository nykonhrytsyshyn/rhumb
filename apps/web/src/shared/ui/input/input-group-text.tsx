import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type InputGroupTextProps = ComponentProps<"span">;

export function InputGroupText({
  className,
  ...props
}: InputGroupTextProps): JSX.Element {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}
