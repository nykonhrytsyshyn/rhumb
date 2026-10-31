import type { JSX, ReactNode } from "react";

export interface DiagramLibraryGridProps {
  readonly children: ReactNode;
}

export function DiagramLibraryGrid({
  children,
}: DiagramLibraryGridProps): JSX.Element {
  return (
    <ul className="grid h-full grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] content-start">
      {children}
    </ul>
  );
}
