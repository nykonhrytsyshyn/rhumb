import type { JSX, ReactNode } from "react";

import { cn } from "@shared/lib/cn";

export interface ErrorScreenCanvasProps {
  readonly children?: ReactNode;
  readonly className?: string;
}

export function ErrorScreenCanvas({
  children,
  className,
}: ErrorScreenCanvasProps): JSX.Element {
  return (
    <div
      className={cn(
        "relative min-h-0 flex-1 overflow-hidden border-b bg-foreground/2",
        className,
      )}
    >
      {children}
    </div>
  );
}
