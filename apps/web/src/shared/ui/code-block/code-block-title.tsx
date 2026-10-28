import { type ComponentProps, type JSX } from "react";

import { cn } from "@shared/lib/cn";

export type CodeBlockTitleProps = ComponentProps<"div">;

export function CodeBlockTitle({
  className,
  ...props
}: CodeBlockTitleProps): JSX.Element {
  return (
    <div
      data-slot="code-block-title"
      className={cn(
        "min-w-0 truncate font-sans text-sm font-medium text-foreground group-data-[size=sm]/code-block:text-xs group-data-[variant=destructive]/code-block:text-destructive [&_svg]:pointer-events-none [&_svg]:inline-block [&_svg]:align-middle [&_svg:not([class*='size-'])]:size-4 group-data-[size=sm]/code-block:[&_svg:not([class*='size-'])]:size-3.5 *:[svg]:me-2",
        className,
      )}
      {...props}
    />
  );
}
