import type { JSX } from "react";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";

export type DropdownMenuRadioGroupProps = MenuPrimitive.RadioGroup.Props;

export function DropdownMenuRadioGroup({
  ...props
}: DropdownMenuRadioGroupProps): JSX.Element {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}
