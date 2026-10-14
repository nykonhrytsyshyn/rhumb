import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type FieldTitleProps = ComponentProps<"div">;

export function FieldTitle({
  className,
  ...props
}: FieldTitleProps): JSX.Element {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
