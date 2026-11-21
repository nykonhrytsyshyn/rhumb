import type { ComponentProps, JSX } from "react";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@shared/lib/cn";

export type DialogDescriptionProps = ComponentProps<
  typeof DialogPrimitive.Description
>;

export function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps): JSX.Element {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
