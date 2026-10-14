import type { JSX } from "react";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";

import { cn } from "@shared/lib/cn";

export type AccordionContentProps = AccordionPrimitive.Panel.Props;

export function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps): JSX.Element {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden px-4 text-sm data-closed:animate-accordion-up data-open:animate-accordion-down"
      {...props}
    >
      <div
        className={cn(
          "h-(--accordion-panel-height) pt-0 pb-4 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}
