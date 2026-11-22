import { type ComponentProps, type JSX } from "react";

import { cn } from "@shared/lib/cn";

export type AlertTitleProps = ComponentProps<"div">;

export function AlertTitle({
  className,
  ...props
}: AlertTitleProps): JSX.Element {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
