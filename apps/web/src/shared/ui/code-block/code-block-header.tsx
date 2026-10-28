import type { ComponentProps, JSX } from "react";

import { cn } from "@shared/lib/cn";

export type CodeBlockHeaderProps = ComponentProps<"div">;

export function CodeBlockHeader({
  className,
  ...props
}: CodeBlockHeaderProps): JSX.Element {
  return (
    <div
      data-slot="code-block-header"
      className={cn(
        "flex min-w-0 shrink-0 items-center gap-2 border-b px-3 py-3 text-muted-foreground group-data-[size=sm]/code-block:px-2.5 group-data-[size=sm]/code-block:py-2.5 group-data-[variant=destructive]/code-block:text-destructive *:has-[>[data-slot=code-block-title]]:min-w-0",
        className,
      )}
      {...props}
    />
  );
}
