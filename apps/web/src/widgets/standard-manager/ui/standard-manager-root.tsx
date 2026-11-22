import type { JSX, ReactNode } from "react";

export interface StandardManagerRootProps {
  readonly children: ReactNode;
}

export function StandardManagerRoot({
  children,
}: StandardManagerRootProps): JSX.Element {
  return <div className="flex flex-col gap-2">{children}</div>;
}
