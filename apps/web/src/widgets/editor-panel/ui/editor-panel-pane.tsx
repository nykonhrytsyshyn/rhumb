import type { JSX, ReactNode } from "react";

import { TabsContent } from "@shared/ui/tabs";

export interface EditorPanelPaneProps {
  readonly value: string;
  /** Stretches the content over the whole area, as the code editor needs. */
  readonly fill?: boolean;
  readonly children: ReactNode;
}

/** What one tab shows. */
export function EditorPanelPane({
  value,
  fill = false,
  children,
}: EditorPanelPaneProps): JSX.Element {
  return (
    <TabsContent
      value={value}
      className={fill ? "flex min-h-0 flex-1 flex-col" : undefined}
    >
      {children}
    </TabsContent>
  );
}
