import type { JSX } from "react";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

export type AlertDialogTriggerProps = AlertDialogPrimitive.Trigger.Props;

export function AlertDialogTrigger({
  ...props
}: AlertDialogTriggerProps): JSX.Element {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}
