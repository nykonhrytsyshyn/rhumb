import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

import { type FieldVariantsProps, fieldVariants } from "./field.styles";

export type FieldProps = ComponentProps<"div"> & FieldVariantsProps;

export function Field({
  className,
  orientation = "vertical",
  ...props
}: FieldProps): JSX.Element {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}
