import type { ComponentProps, JSX } from "react";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";

export type DropdownMenuSubProps = ComponentProps<
  typeof MenuPrimitive.SubmenuRoot
>;

export function DropdownMenuSub({
  ...props
}: DropdownMenuSubProps): JSX.Element {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}
