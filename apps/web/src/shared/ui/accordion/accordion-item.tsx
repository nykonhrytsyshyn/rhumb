import type { JSX } from "react";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";

import { cn } from "@shared/lib/cn";

export type AccordionItemProps = AccordionPrimitive.Item.Props;

export function AccordionItem({
  className,
  ...props
}: AccordionItemProps): JSX.Element {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b data-open:bg-muted/50", className)}
      {...props}
    />
  );
}
