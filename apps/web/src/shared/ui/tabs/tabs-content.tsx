import type { JSX } from "react";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@shared/lib/cn";

export type TabsContentProps = TabsPrimitive.Panel.Props;

export function TabsContent({
  className,
  ...props
}: TabsContentProps): JSX.Element {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}
