import type { ComponentProps, JSX } from "react";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

export type PopoverTriggerProps = ComponentProps<
  typeof PopoverPrimitive.Trigger
>;

export function PopoverTrigger({ ...props }: PopoverTriggerProps): JSX.Element {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}
