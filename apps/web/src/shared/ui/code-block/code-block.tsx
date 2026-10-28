import { type ComponentProps, type JSX } from "react";

import { type VariantProps } from "class-variance-authority";

import { cn } from "@shared/lib/cn";

import { codeBlockVariants } from "./code-block.styles";

export interface CodeBlockProps
  extends ComponentProps<"div">, VariantProps<typeof codeBlockVariants> {
  size?: "default" | "sm";
}

export function CodeBlock({
  className,
  variant = "default",
  size = "default",
  ...props
}: CodeBlockProps): JSX.Element {
  return (
    <div
      data-slot="code-block"
      data-variant={variant}
      data-size={size}
      className={cn(codeBlockVariants({ variant }), className)}
      {...props}
    />
  );
}
