import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";

import {
  type InputGroupButtonVariantsProps,
  inputGroupButtonVariants,
} from "./input-group-button.styles";

export interface InputGroupButtonProps
  extends
    Omit<ComponentProps<typeof Button>, "size" | "type">,
    InputGroupButtonVariantsProps {
  type?: "button" | "submit" | "reset";
}

export function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: InputGroupButtonProps): JSX.Element {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}
