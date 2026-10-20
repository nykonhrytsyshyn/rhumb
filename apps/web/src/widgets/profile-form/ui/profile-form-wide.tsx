import type { JSX, ReactNode } from "react";

import { cn } from "@shared/lib/cn";

export interface ProfileFormWideProps {
  readonly stacked?: boolean;
  readonly children: ReactNode;
}

export function ProfileFormWide({
  stacked = false,
  children,
}: ProfileFormWideProps): JSX.Element {
  return (
    <div className={cn("col-span-2", stacked && "grid gap-3")}>{children}</div>
  );
}
