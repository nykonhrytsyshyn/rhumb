import type { ComponentProps, JSX } from "react";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@shared/lib/cn";

export type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>;

export function DialogTitle({
  className,
  ...props
}: DialogTitleProps): JSX.Element {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-medium", className)}
      {...props}
    />
  );
}
