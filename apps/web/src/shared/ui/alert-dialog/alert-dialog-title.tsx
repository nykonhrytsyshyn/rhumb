import type { ComponentProps, JSX } from "react";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

import { cn } from "@shared/lib/cn";

export type AlertDialogTitleProps = ComponentProps<
  typeof AlertDialogPrimitive.Title
>;

export function AlertDialogTitle({
  className,
  ...props
}: AlertDialogTitleProps): JSX.Element {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "text-lg font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className,
      )}
      {...props}
    />
  );
}
