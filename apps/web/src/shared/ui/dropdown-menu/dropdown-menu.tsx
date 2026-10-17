import type { ComponentProps, JSX } from "react";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";

export type DropdownMenuProps = ComponentProps<typeof MenuPrimitive.Root>;

export function DropdownMenu({ ...props }: DropdownMenuProps): JSX.Element {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}
