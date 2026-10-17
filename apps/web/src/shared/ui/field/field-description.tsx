import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type FieldDescriptionProps = ComponentProps<"p">;

export function FieldDescription({
  className,
  ...props
}: FieldDescriptionProps): JSX.Element {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}
