import type { JSX } from "react";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

import { cn } from "@shared/lib/cn";

import { AlertDialogOverlay } from "./alert-dialog-overlay";
import { AlertDialogPortal } from "./alert-dialog-portal";

export interface AlertDialogContentProps
  extends AlertDialogPrimitive.Popup.Props {
  size?: "default" | "sm";
}

export function AlertDialogContent({
  className,
  size = "default",
  ...props
}: AlertDialogContentProps): JSX.Element {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-6 rounded-4xl bg-popover p-6 text-popover-foreground shadow-xl ring-1 ring-foreground/5 duration-100 outline-none data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-md dark:ring-foreground/10",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}
