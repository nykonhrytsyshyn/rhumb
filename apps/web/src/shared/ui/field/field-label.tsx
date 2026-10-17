import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";
import { Label } from "@shared/ui/label";

export type FieldLabelProps = ComponentProps<typeof Label>;

export function FieldLabel({
  className,
  ...props
}: FieldLabelProps): JSX.Element {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:bg-input/30 has-[>[data-slot=field]]:rounded-2xl has-[>[data-slot=field]]:border *:data-[slot=field]:p-4",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className,
      )}
      {...props}
    />
  );
}
