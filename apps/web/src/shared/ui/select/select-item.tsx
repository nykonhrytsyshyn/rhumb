import type { JSX } from "react";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { IconCheck } from "@tabler/icons-react";

import { cn } from "@shared/lib/cn";

export type SelectItemProps = SelectPrimitive.Item.Props;

export function SelectItem({
  className,
  children,
  ...props
}: SelectItemProps): JSX.Element {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 py-2 pr-8 pl-3 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex-1 gap-2 truncate whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>

      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
            <IconCheck className="pointer-events-none" />
          </span>
        }
      />
    </SelectPrimitive.Item>
  );
}
