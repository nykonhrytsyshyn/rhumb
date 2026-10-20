import type { JSX, ReactNode } from "react";

export interface EditorPanelContentProps {
  readonly children: ReactNode;
}

export function EditorPanelContent({
  children,
}: EditorPanelContentProps): JSX.Element {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto border-t">
      {children}
    </div>
  );
}
