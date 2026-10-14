import type { JSX } from "react";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

import { cn } from "@shared/lib/cn";

export type AccordionTriggerProps = AccordionPrimitive.Trigger.Props;

export function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps): JSX.Element {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between gap-6 border border-transparent p-4 text-left text-sm font-medium transition-all outline-none hover:underline aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children}
        <IconChevronDown
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <IconChevronUp
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}
