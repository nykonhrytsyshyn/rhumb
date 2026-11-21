import type { JSX, ReactNode } from "react";

export interface ExportDialogBodyProps {
  readonly children: ReactNode;
}

export function ExportDialogBody({
  children,
}: ExportDialogBodyProps): JSX.Element {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto border-t md:flex-row md:overflow-hidden">
      {children}
    </div>
  );
}
