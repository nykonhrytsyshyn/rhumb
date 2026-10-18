import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";
import { Input } from "@shared/ui/input";

export type InputGroupInputProps = ComponentProps<"input">;

export function InputGroupInput({
  className,
  ...props
}: InputGroupInputProps): JSX.Element {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}
