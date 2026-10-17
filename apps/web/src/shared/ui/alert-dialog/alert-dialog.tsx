import type { JSX } from "react";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

export type AlertDialogProps = AlertDialogPrimitive.Root.Props;

export function AlertDialog({ ...props }: AlertDialogProps): JSX.Element {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}
