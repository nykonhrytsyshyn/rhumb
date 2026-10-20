import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

import { type AlertVariantsProps, alertVariants } from "./alert.styles";

export type AlertProps = ComponentProps<"div"> & AlertVariantsProps;

export function Alert({
  className,
  variant,
  ...props
}: AlertProps): JSX.Element {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}
