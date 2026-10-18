import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

import {
  type InputGroupAddonVariantsProps,
  inputGroupAddonVariants,
} from "./input-group-addon.styles";

export type InputGroupAddonProps = ComponentProps<"div"> &
  InputGroupAddonVariantsProps;

export function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: InputGroupAddonProps): JSX.Element {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      }}
      {...props}
    />
  );
}
