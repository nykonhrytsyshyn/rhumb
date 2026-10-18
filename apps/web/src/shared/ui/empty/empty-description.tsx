import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type EmptyDescriptionProps = ComponentProps<"p">;

export function EmptyDescription({
  className,
  ...props
}: EmptyDescriptionProps): JSX.Element {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}
