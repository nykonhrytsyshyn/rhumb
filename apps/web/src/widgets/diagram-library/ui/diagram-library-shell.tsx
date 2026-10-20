import type { JSX, ReactNode } from "react";

export interface DiagramLibraryShellProps {
  readonly children: ReactNode;
}

export function DiagramLibraryShell({
  children,
}: DiagramLibraryShellProps): JSX.Element {
  return <div className="flex h-full flex-col">{children}</div>;
}
