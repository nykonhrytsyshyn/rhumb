import type { ComponentProps, JSX } from "react";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { IconChevronDown } from "@tabler/icons-react";

import { cn } from "@shared/lib/cn";

export type SelectScrollDownButtonProps = ComponentProps<
  typeof SelectPrimitive.ScrollDownArrow
>;

export function SelectScrollDownButton({
  className,
  ...props
}: SelectScrollDownButtonProps): JSX.Element {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <IconChevronDown />
    </SelectPrimitive.ScrollDownArrow>
  );
}
