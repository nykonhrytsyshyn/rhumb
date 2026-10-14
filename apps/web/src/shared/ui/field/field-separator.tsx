import type { ComponentProps, JSX, ReactNode } from "react";

import { cn } from "@shared/lib/cn";
import { Separator } from "@shared/ui/separator";

export interface FieldSeparatorProps extends ComponentProps<"div"> {
  children?: ReactNode;
}

export function FieldSeparator({
  children,
  className,
  ...props
}: FieldSeparatorProps): JSX.Element {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />

      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}
