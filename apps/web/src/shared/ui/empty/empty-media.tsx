import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

import {
  type EmptyMediaVariantsProps,
  emptyMediaVariants,
} from "./empty-media.styles";

export type EmptyMediaProps = ComponentProps<"div"> & EmptyMediaVariantsProps;

export function EmptyMedia({
  className,
  variant = "default",
  ...props
}: EmptyMediaProps): JSX.Element {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}
