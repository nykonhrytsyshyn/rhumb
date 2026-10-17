import type { JSX } from "react";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

export type AlertDialogPortalProps = AlertDialogPrimitive.Portal.Props;

export function AlertDialogPortal({
  ...props
}: AlertDialogPortalProps): JSX.Element {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}
