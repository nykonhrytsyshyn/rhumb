import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type FieldSetProps = ComponentProps<"fieldset">;

export function FieldSet({ className, ...props }: FieldSetProps): JSX.Element {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
}
