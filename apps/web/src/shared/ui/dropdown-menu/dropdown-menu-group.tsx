import type { ComponentProps, JSX } from "react";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";

export type DropdownMenuGroupProps = ComponentProps<typeof MenuPrimitive.Group>;

export function DropdownMenuGroup({
  ...props
}: DropdownMenuGroupProps): JSX.Element {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}
