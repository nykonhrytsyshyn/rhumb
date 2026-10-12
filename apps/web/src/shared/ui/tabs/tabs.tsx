import type { JSX } from "react";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@shared/lib/cn";

export type TabsProps = TabsPrimitive.Root.Props;

export function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsProps): JSX.Element {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className,
      )}
      {...props}
    />
  );
}
