import type { ComponentProps, JSX } from "react";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { IconChevronUp } from "@tabler/icons-react";

import { cn } from "@shared/lib/cn";

export type SelectScrollUpButtonProps = ComponentProps<
  typeof SelectPrimitive.ScrollUpArrow
>;

export function SelectScrollUpButton({
  className,
  ...props
}: SelectScrollUpButtonProps): JSX.Element {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <IconChevronUp />
    </SelectPrimitive.ScrollUpArrow>
  );
}
