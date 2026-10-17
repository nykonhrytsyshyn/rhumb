import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type FieldGroupProps = ComponentProps<"div">;

export function FieldGroup({
  className,
  ...props
}: FieldGroupProps): JSX.Element {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className,
      )}
      {...props}
    />
  );
}
