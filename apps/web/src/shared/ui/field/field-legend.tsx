import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export interface FieldLegendProps extends ComponentProps<"legend"> {
  variant?: "legend" | "label";
}

export function FieldLegend({
  className,
  variant = "legend",
  ...props
}: FieldLegendProps): JSX.Element {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className,
      )}
      {...props}
    />
  );
}
