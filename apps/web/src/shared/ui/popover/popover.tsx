import type { ComponentProps, JSX } from "react";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

export type PopoverProps = ComponentProps<typeof PopoverPrimitive.Root>;

export function Popover({ ...props }: PopoverProps): JSX.Element {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}
