import type { JSX } from "react";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

export type TooltipProps = TooltipPrimitive.Root.Props;

export function Tooltip({ ...props }: TooltipProps): JSX.Element {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}
