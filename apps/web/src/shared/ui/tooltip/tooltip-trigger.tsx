import type { JSX } from "react";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

export type TooltipTriggerProps = TooltipPrimitive.Trigger.Props;

export function TooltipTrigger({ ...props }: TooltipTriggerProps): JSX.Element {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}
