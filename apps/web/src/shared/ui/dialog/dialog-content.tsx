import type { JSX } from "react";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { IconX } from "@tabler/icons-react";

import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";

import { DialogOverlay } from "./dialog-overlay";
import { DialogPortal } from "./dialog-portal";

export interface DialogContentProps extends DialogPrimitive.Popup.Props {
  closeLabel?: string;
}

export function DialogContent({
  className,
  children,
  closeLabel,
  ...props
}: DialogContentProps): JSX.Element {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 rounded-2xl bg-popover text-popover-foreground shadow-xl ring-1 ring-foreground/5 duration-100 outline-none data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 sm:max-w-md dark:ring-foreground/10",
          className,
        )}
        {...props}
      >
        {children}

        {closeLabel === undefined ? null : (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            aria-label={closeLabel}
            title={closeLabel}
            render={
              <Button
                variant="ghost"
                size="icon-lg"
                className="absolute top-2 right-2"
              />
            }
          >
            <IconX />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}
