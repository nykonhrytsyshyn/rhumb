import type { JSX } from "react";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

export type TooltipProviderProps = TooltipPrimitive.Provider.Props;

export function TooltipProvider({
  delay = 0,
  ...props
}: TooltipProviderProps): JSX.Element {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  );
}
