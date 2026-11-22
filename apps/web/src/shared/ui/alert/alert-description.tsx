import { type ComponentProps, type JSX } from "react";

import { cn } from "@shared/lib/cn";

export type AlertDescriptionProps = ComponentProps<"div">;

export function AlertDescription({
  className,
  ...props
}: AlertDescriptionProps): JSX.Element {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className,
      )}
      {...props}
    />
  );
}
