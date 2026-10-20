import type { JSX, ReactNode } from "react";

import { cn } from "@shared/lib/cn";

export interface ErrorScreenTitleProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function ErrorScreenTitle({
  children,
  className,
}: ErrorScreenTitleProps): JSX.Element {
  return (
    <h1
      className={cn(
        "text-center font-sans text-5xl font-bold tracking-tight md:text-left md:text-6xl lg:text-8xl xl:text-[100px]",
        className,
      )}
    >
      {children}
    </h1>
  );
}
