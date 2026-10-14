import type { JSX } from "react";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";

import { cn } from "@shared/lib/cn";

export type AccordionProps = AccordionPrimitive.Root.Props;

export function Accordion({
  className,
  ...props
}: AccordionProps): JSX.Element {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-2xl border",
        className,
      )}
      {...props}
    />
  );
}
