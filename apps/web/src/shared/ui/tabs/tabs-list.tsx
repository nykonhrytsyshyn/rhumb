import type { JSX } from "react";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@shared/lib/cn";

import type { TabsListVariantsProps } from "./tabs-list.styles";
import { tabsListVariants } from "./tabs-list.styles";

export type TabsListProps = TabsPrimitive.List.Props & TabsListVariantsProps;

export function TabsList({
  className,
  variant = "default",
  ...props
}: TabsListProps): JSX.Element {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}
