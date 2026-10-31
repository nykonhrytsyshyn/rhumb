import type { JSX, ReactNode, Ref } from "react";

export interface DiagramLibraryShellProps {
  readonly ref?: Ref<HTMLDivElement>;
  readonly children: ReactNode;
}

export function DiagramLibraryShell({
  ref,
  children,
}: DiagramLibraryShellProps): JSX.Element {
  return (
    <div ref={ref} className="flex h-full flex-col">
      {children}
    </div>
  );
}
