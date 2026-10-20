import type { JSX, ReactNode } from "react";

import { Tabs } from "@shared/ui/tabs";

import { useEditorPanel } from "../model";

export interface EditorPanelBodyProps {
  readonly children: ReactNode;
}

export function EditorPanelBody({
  children,
}: EditorPanelBodyProps): JSX.Element {
  const { activeTab, setActiveTab } = useEditorPanel();

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col md:w-[min(33.333vw,36rem)] md:shrink-0">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        {children}
      </Tabs>
    </div>
  );
}
