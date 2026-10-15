import type { ComponentProps, JSX } from "react";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";

export type DropdownMenuPortalProps = ComponentProps<
  typeof MenuPrimitive.Portal
>;

export function DropdownMenuPortal({
  ...props
}: DropdownMenuPortalProps): JSX.Element {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}
