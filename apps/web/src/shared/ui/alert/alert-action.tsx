import { type ComponentProps, type JSX } from "react";

import { cn } from "@shared/lib/cn";

export type AlertActionProps = ComponentProps<"div">;

export function AlertAction({
  className,
  ...props
}: AlertActionProps): JSX.Element {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  );
}
