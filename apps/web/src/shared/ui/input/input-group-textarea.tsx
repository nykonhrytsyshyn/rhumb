import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";
import { Textarea } from "@shared/ui/textarea";

export type InputGroupTextareaProps = ComponentProps<"textarea">;

export function InputGroupTextarea({
  className,
  ...props
}: InputGroupTextareaProps): JSX.Element {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2.5 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}
