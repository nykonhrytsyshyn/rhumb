import type { JSX } from "react";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

export type CollapsibleProps = CollapsiblePrimitive.Root.Props;

export function Collapsible({ ...props }: CollapsibleProps): JSX.Element {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}
