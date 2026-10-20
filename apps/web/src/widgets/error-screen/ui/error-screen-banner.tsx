import type { JSX, ReactNode } from "react";

import { cn } from "@shared/lib/cn";

export interface ErrorScreenBannerProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function ErrorScreenBanner({
  children,
  className,
}: ErrorScreenBannerProps): JSX.Element {
  return (
    <div className={cn("flex w-full shrink-0 flex-col p-4 sm:p-8", className)}>
      <div
        className={cn(
          "relative flex min-h-[30vh] w-full flex-col items-center justify-center px-6 py-10 md:px-16 md:py-12",
          "bg-[radial-gradient(currentColor_2px,transparent_2px)] bg-size-[30px_30px] text-border",
        )}
      >
        <div className="relative z-10 flex w-full flex-col items-center justify-between gap-8 text-foreground md:flex-row md:gap-12">
          {children}
        </div>
      </div>
    </div>
  );
}
