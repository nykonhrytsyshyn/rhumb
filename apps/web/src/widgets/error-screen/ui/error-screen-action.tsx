import type { JSX, ReactNode } from "react";

import { cn } from "@shared/lib/cn";

export interface ErrorScreenActionProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function ErrorScreenAction({
  children,
  className,
}: ErrorScreenActionProps): JSX.Element {
  return (
    <div className={cn("flex shrink-0 items-center justify-center", className)}>
      {children}
    </div>
  );
}
