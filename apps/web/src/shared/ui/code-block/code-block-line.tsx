import { type ComponentProps, type JSX } from "react";

import { type VariantProps } from "class-variance-authority";

import { cn } from "@shared/lib/cn";

import { codeBlockLineVariants } from "./code-block-line.styles";

export type CodeBlockLineProps = ComponentProps<"span"> &
  VariantProps<typeof codeBlockLineVariants>;

export function CodeBlockLine({
  className,
  variant = "default",
  children,
  ...props
}: CodeBlockLineProps): JSX.Element {
  const empty =
    children === undefined ||
    children === null ||
    children === "" ||
    (Array.isArray(children) && children.length === 0);

  return (
    <span
      data-slot="code-block-line"
      data-variant={variant}
      className={cn(codeBlockLineVariants({ variant }), className)}
      {...props}
    >
      <span data-slot="code-block-line-content" className="min-w-0">
        {empty ? "\n" : children}
      </span>
    </span>
  );
}
