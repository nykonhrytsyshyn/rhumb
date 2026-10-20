import { type JSX, type ReactNode, useMemo } from "react";

import { cn } from "@shared/lib/cn";

import { ErrorScreenContext } from "../model";

export interface ErrorScreenShellProps {
  readonly code: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function ErrorScreenShell({
  code,
  children,
  className,
}: ErrorScreenShellProps): JSX.Element {
  const value = useMemo(() => ({ code }), [code]);

  return (
    <ErrorScreenContext.Provider value={value}>
      <main
        className={cn(
          "flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground",
          className,
        )}
      >
        {children}
      </main>
    </ErrorScreenContext.Provider>
  );
}
