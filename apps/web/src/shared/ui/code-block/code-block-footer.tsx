import { type ComponentProps, type JSX } from "react";

import { cn } from "@shared/lib/cn";

export type CodeBlockFooterProps = ComponentProps<"div">;

export function CodeBlockFooter({
  className,
  ...props
}: CodeBlockFooterProps): JSX.Element {
  return (
    <div
      data-slot="code-block-footer"
      className={cn(
        "flex min-w-0 shrink-0 items-center gap-2 px-4 pb-4 text-muted-foreground group-data-[size=sm]/code-block:px-3 group-data-[size=sm]/code-block:pb-3",
        className,
      )}
      {...props}
    />
  );
}
