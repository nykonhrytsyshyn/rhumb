import type { JSX } from "react";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

import { cn } from "@shared/lib/cn";

export type CollapsibleContentProps = CollapsiblePrimitive.Panel.Props;

export function CollapsibleContent({
  className,
  children,
  ...props
}: CollapsibleContentProps): JSX.Element {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-300 ease-out",
        "[&[data-starting-style],&[data-ending-style]]:h-0",
      )}
      {...props}
    >
      <div className={className as string | undefined}>{children}</div>
    </CollapsiblePrimitive.Panel>
  );
}
