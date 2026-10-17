import type { ComponentProps, JSX } from "react";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";

export type DropdownMenuTriggerProps = ComponentProps<
  typeof MenuPrimitive.Trigger
>;

export function DropdownMenuTrigger({
  ...props
}: DropdownMenuTriggerProps): JSX.Element {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}
