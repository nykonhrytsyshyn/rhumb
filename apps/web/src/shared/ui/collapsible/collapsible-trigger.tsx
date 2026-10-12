import type { JSX } from "react";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

export type CollapsibleTriggerProps = CollapsiblePrimitive.Trigger.Props;

export function CollapsibleTrigger({
  ...props
}: CollapsibleTriggerProps): JSX.Element {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  );
}
